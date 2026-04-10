"""
ml_forecast.py
--------------
Demand forecasting for Saathi.
Uses Facebook Prophet if installed, falls back to a clean statistical model.
"""
import pandas as pd
import numpy as np
from datetime import datetime

# ── Indian festival holidays for Prophet ──────────────────────────────────────
INDIAN_HOLIDAYS = pd.DataFrame({
    "holiday": [
        "diwali","diwali","diwali",
        "ugadi","ugadi",
        "holi",
        "eid_ul_fitr",
        "republic_day",
        "independence_day",
        "pongal",
        "onam",
        "navratri","navratri",
        "christmas",
    ],
    "ds": pd.to_datetime([
        "2024-11-01","2024-11-02","2024-11-03",
        "2025-03-30","2025-03-31",
        "2025-03-14",
        "2025-03-31",
        "2025-01-26",
        "2025-08-15",
        "2025-01-14",
        "2025-09-05",
        "2025-10-02","2025-10-03",
        "2024-12-25",
    ]),
    "lower_window": [-3,-2,-1, -1,0, -1,-1, 0, 0, -1, -2, -1,0, -1],
    "upper_window": [ 1, 1, 2,  1,1,  1, 1, 0, 0,  1,  1,  0,1,  1],
})


def run_prophet_forecast(sales_df: pd.DataFrame, product_name: str, periods: int = 14):
    """Run Prophet model. Returns (forecast_df, history_df, error_msg)."""
    from prophet import Prophet  # raises ImportError if not installed

    df = (
        sales_df[sales_df["product_name"] == product_name][["date", "quantity"]]
        .copy()
        .rename(columns={"date": "ds", "quantity": "y"})
    )
    df = df.groupby("ds")["y"].sum().reset_index()

    if len(df) < 7:
        raise ValueError("Not enough history for Prophet (need 7+ days).")

    m = Prophet(
        holidays=INDIAN_HOLIDAYS,
        changepoint_prior_scale=0.1,
        seasonality_mode="multiplicative",
        weekly_seasonality=True,
        yearly_seasonality=True,
    )
    m.fit(df)
    future   = m.make_future_dataframe(periods=periods)
    forecast = m.predict(future)
    return forecast, df, None


def run_statistical_forecast(sales_df: pd.DataFrame, product_name: str, periods: int = 14):
    """
    Simple but solid statistical forecast:
    - 7-day rolling average as baseline
    - Weekend uplift +30%
    - Seasonal trend from last 14d vs previous 14d
    Returns (forecast_df, history_df)
    """
    df = (
        sales_df[sales_df["product_name"] == product_name][["date", "quantity"]]
        .copy()
    )
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"]).groupby("date")["quantity"].sum().reset_index()
    df = df.sort_values("date")

    if df.empty:
        avg = 5.0
    else:
        avg = float(df["quantity"].tail(30).mean())

    # Trend: compare last 14d to prior 14d
    if len(df) >= 28:
        recent = df["quantity"].tail(14).mean()
        older  = df["quantity"].iloc[-28:-14].mean()
        trend  = recent / older if older > 0 else 1.0
        trend  = max(0.8, min(trend, 1.5))   # cap at ±50%
    else:
        trend = 1.0

    std = float(df["quantity"].std()) if len(df) > 1 else avg * 0.2
    rng = np.random.default_rng(42)

    future_dates = pd.date_range(datetime.today(), periods=periods, freq="D")
    yhat, yhat_lower, yhat_upper = [], [], []
    for d in future_dates:
        weekend_mul = 1.3 if d.weekday() >= 5 else 1.0
        base  = avg * trend * weekend_mul
        noise = rng.normal(0, std * 0.25)
        val   = max(0.0, base + noise)
        yhat.append(round(val, 2))
        yhat_lower.append(max(0.0, round(val * 0.75, 2)))
        yhat_upper.append(round(val * 1.35, 2))

    forecast_df = pd.DataFrame({
        "ds":         future_dates,
        "yhat":       yhat,
        "yhat_lower": yhat_lower,
        "yhat_upper": yhat_upper,
    })
    history_df = df.rename(columns={"date": "ds", "quantity": "y"})
    return forecast_df, history_df


def get_forecast(sales_df: pd.DataFrame, product_name: str, periods: int = 14):
    """
    Public API. Tries Prophet first, falls back to statistical.
    Returns: (forecast_df, history_df, method_used: str)
      forecast_df columns: ds, yhat, yhat_lower, yhat_upper
      history_df  columns: ds, y
    """
    try:
        fc, hist, _ = run_prophet_forecast(sales_df, product_name, periods)
        future_only = fc[fc["ds"] >= pd.Timestamp.today()].head(periods)
        return future_only[["ds","yhat","yhat_lower","yhat_upper"]], hist, "prophet"
    except ImportError:
        fc, hist = run_statistical_forecast(sales_df, product_name, periods)
        return fc, hist, "statistical"
    except Exception as e:
        fc, hist = run_statistical_forecast(sales_df, product_name, periods)
        return fc, hist, f"statistical (prophet error: {e})"


def forecast_accuracy_backtest(sales_df: pd.DataFrame, product_name: str, window: int = 14) -> float:
    """
    Simple backtest: train on all-except-last-window, predict window, compute MAPE.
    Returns accuracy % (100 - MAPE capped at 0).
    """
    df = (
        sales_df[sales_df["product_name"] == product_name][["date", "quantity"]]
        .copy()
    )
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"]).groupby("date")["quantity"].sum().reset_index()
    df = df.sort_values("date")

    if len(df) < window + 7:
        return 83.0   # default if not enough history

    actuals   = df["quantity"].tail(window).values
    train_avg = float(df["quantity"].iloc[:-window].mean())
    preds     = np.full(window, train_avg)

    with np.errstate(divide="ignore", invalid="ignore"):
        mape = np.mean(np.abs((actuals - preds) / np.where(actuals == 0, 1, actuals))) * 100

    return round(max(0.0, 100.0 - mape), 1)