import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from utils.data_loader import load_inventory, load_sales
from utils.ml_forecast import get_forecast, forecast_accuracy_backtest

TEAL   = "#1F7A7A"; MINT = "#4FBDBA"; ORANGE = "#F77F00"
YELLOW = "#F4C430"; GREEN = "#2ECC71"; RED = "#E63946"; AMBER = "#FFB703"


@st.cache_data(show_spinner=False)
def cached_forecast(product_name: str, periods: int):
    sales = load_sales()
    sales["date"] = pd.to_datetime(sales["date"], errors="coerce")
    sales = sales.dropna(subset=["date"])
    fc, hist, method = get_forecast(sales, product_name, periods)
    acc = forecast_accuracy_backtest(sales, product_name)
    return fc, hist, method, acc


def render(render_topbar):
    render_topbar("Demand Forecast", "AI-powered predictions with Indian festival awareness")
    st.markdown('<div class="dash-body">', unsafe_allow_html=True)

    sales = load_sales()
    sales["date"] = pd.to_datetime(sales["date"], errors="coerce")
    sales = sales.dropna(subset=["date"])
    inventory = load_inventory()
    products  = sorted(sales["product_name"].unique())

    # ── Controls ────────────────────────────────────────────
    cf1, cf2, cf3 = st.columns([1.5, 0.8, 0.8], gap="medium")
    with cf1: selected = st.selectbox("Select Product", products, key="fc_product")
    with cf2: periods  = st.selectbox("Forecast Horizon", [7, 14, 21, 30], index=1, key="fc_periods")
    with cf3:
        st.markdown("<div style='height:28px'></div>", unsafe_allow_html=True)
        st.button("🔮 Run Forecast", key="fc_run")

    with st.spinner("Running AI forecast…"):
        fc, hist, method, accuracy = cached_forecast(selected, periods)

    badge_color = ("rgba(46,204,113,0.1)", "rgba(46,204,113,0.25)", "#1aab5a", "✅ Prophet ML model active") \
        if method == "prophet" else \
        ("rgba(255,183,3,0.1)", "rgba(255,183,3,0.3)", "#a07800", "⚡ Statistical model · pip install prophet for full ML")
    st.markdown(f'<div style="display:inline-block;background:{badge_color[0]};border:1px solid {badge_color[1]};'
                f'border-radius:99px;padding:3px 12px;font-size:11px;font-weight:600;color:{badge_color[2]};margin-bottom:14px;">'
                f'{badge_color[3]}</div>', unsafe_allow_html=True)

    # ── KPIs ────────────────────────────────────────────────
    total_pred = fc["yhat"].sum()
    daily_avg  = fc["yhat"].mean()
    peak_row   = fc.loc[fc["yhat"].idxmax()]
    inv_row    = inventory[inventory["product_name"] == selected]
    mrp_val    = float(inv_row["cost_price"].values[0]) * 1.25 if not inv_row.empty else 0

    c1, c2, c3, c4 = st.columns(4, gap="medium")
    for col, (icon,bg,val,label,delta) in zip([c1,c2,c3,c4],[
        ("📦","rgba(31,122,122,0.1)",f"{int(total_pred)}",f"Predicted units ({periods}d)",f"Avg {daily_avg:.1f}/day"),
        ("📅","rgba(244,196,48,0.12)",f"{int(peak_row['yhat'])}","Peak day demand",peak_row["ds"].strftime("%d %b")),
        ("💰","rgba(46,204,113,0.1)",f"₹{total_pred*mrp_val:,.0f}","Expected revenue",f"{periods}-day estimate"),
        ("🎯","rgba(79,189,186,0.12)",f"{accuracy}%","Forecast accuracy","Backtest result"),
    ]):
        with col:
            st.markdown(f"""<div class="kpi-card">
              <div class="kpi-icon" style="background:{bg};">{icon}</div>
              <div class="kpi-val">{val}</div><div class="kpi-lbl">{label}</div>
              <div class="kpi-delta d-up">▲ {delta}</div>
            </div>""", unsafe_allow_html=True)

    st.markdown("<div style='height:18px'></div>", unsafe_allow_html=True)

    # ── Main chart ──────────────────────────────────────────
    st.markdown('<div class="sec-card">', unsafe_allow_html=True)
    st.markdown(f'<div class="sec-title">📈 {selected} — Demand Forecast</div>'
                f'<div class="sec-sub">Historical actuals + {periods}-day AI prediction with confidence band</div>',
                unsafe_allow_html=True)
    fig = go.Figure()

    if "yhat_lower" in fc.columns:
        fig.add_trace(go.Scatter(
            x=pd.concat([fc["ds"], fc["ds"].iloc[::-1]]),
            y=pd.concat([fc["yhat_upper"], fc["yhat_lower"].iloc[::-1]]),
            fill="toself", fillcolor="rgba(247,127,0,0.08)",
            line=dict(color="rgba(0,0,0,0)"), name="Confidence band", hoverinfo="skip",
        ))
    if not hist.empty:
        fig.add_trace(go.Scatter(
            x=hist.tail(60)["ds"], y=hist.tail(60)["y"], mode="lines+markers",
            name="Actual sales", line=dict(color=TEAL, width=2.5), marker=dict(size=4),
            hovertemplate="<b>%{x|%d %b}</b><br>%{y:.0f} units<extra></extra>",
        ))
    fig.add_trace(go.Scatter(
        x=fc["ds"], y=fc["yhat"], mode="lines+markers",
        name="AI forecast", line=dict(color=ORANGE, width=2.5, dash="dash"),
        marker=dict(size=5),
        hovertemplate="<b>%{x|%d %b}</b><br>%{y:.1f} units<extra></extra>",
    ))
    try:
        fig.add_vline(x="2025-03-30", line_dash="dot", line_color=YELLOW, line_width=1.5,
                      annotation_text="🎊 Ugadi", annotation_font_size=11, annotation_font_color=YELLOW)
    except Exception:
        pass
    fig.update_layout(
        height=300, margin=dict(l=0,r=0,t=10,b=0),
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        legend=dict(orientation="h", y=-0.18, font=dict(size=11)),
        xaxis=dict(showgrid=False, tickfont=dict(size=11,color="#8AB8A8")),
        yaxis=dict(showgrid=True, gridcolor="rgba(31,122,122,0.08)",
                   tickfont=dict(size=11,color="#8AB8A8")),
        hovermode="x unified",
    )
    st.plotly_chart(fig, use_container_width=True, config={"displayModeBar":False})
    st.markdown("</div>", unsafe_allow_html=True)

    # ── Day table + Category chart ──────────────────────────
    col_tbl, col_cat = st.columns([1.2, 1], gap="medium")

    with col_tbl:
        st.markdown('<div class="sec-card">', unsafe_allow_html=True)
        st.markdown('<div class="sec-title">📅 Day-by-day Breakdown</div>'
                    '<div class="sec-sub">Stock drawdown projection</div>', unsafe_allow_html=True)
        cur_stock_val = int(inv_row["current_stock"].values[0]) if not inv_row.empty else 20
        running = cur_stock_val
        rows = ""
        for _, r in fc.iterrows():
            pred     = max(0, int(round(r["yhat"])))
            running -= pred
            col_s    = RED if running <= 0 else (AMBER if running <= 5 else "#1aab5a")
            status   = "🔴 Stockout" if running <= 0 else ("🟡 Low" if running <= 5 else "🟢 OK")
            rows += f"""<tr>
              <td style="font-family:'DM Mono',monospace;font-size:12px;">{r['ds'].strftime('%d %b, %a')}</td>
              <td style="text-align:center;font-weight:600;">{pred}</td>
              <td style="text-align:center;color:{col_s};font-weight:600;">{max(0,running)}</td>
              <td style="text-align:right;font-size:12px;color:{col_s};">{status}</td>
            </tr>"""
        st.markdown(f"""<table class="s-table">
          <thead><tr><th>Date</th><th style="text-align:center;">Predicted</th>
          <th style="text-align:center;">Stock Left</th><th style="text-align:right;">Status</th></tr></thead>
          <tbody>{rows}</tbody></table>""", unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)

    with col_cat:
        st.markdown('<div class="sec-card">', unsafe_allow_html=True)
        st.markdown('<div class="sec-title">🏪 Top Products Demand</div>'
                    '<div class="sec-sub">Average daily sales volume</div>', unsafe_allow_html=True)
        top_demand = (sales.groupby("product_name")["quantity"].mean()
                      .sort_values(ascending=True).tail(8))
        clrs = [TEAL, MINT, YELLOW, ORANGE, GREEN, AMBER, "#FF6B6B", "#4ECDC4"]
        fig3 = go.Figure(go.Bar(
            y=top_demand.index, x=(top_demand.values * periods).round(0),
            orientation="h",
            marker_color=clrs[:len(top_demand)],
            text=[f"{v:.0f}" for v in top_demand.values * periods],
            textposition="auto",
            hovertemplate="<b>%{y}</b><br>%{x:.0f} units<extra></extra>",
        ))
        fig3.update_layout(
            height=280, margin=dict(l=0,r=0,t=0,b=0),
            paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
            xaxis=dict(showgrid=True, gridcolor="rgba(31,122,122,0.08)",
                       tickfont=dict(size=10,color="#8AB8A8")),
            yaxis=dict(tickfont=dict(size=11,color="#4A6565")), showlegend=False,
        )
        st.plotly_chart(fig3, use_container_width=True, config={"displayModeBar":False})
        st.markdown("</div>", unsafe_allow_html=True)

    # ── Reorder tip ─────────────────────────────────────────
    reorder_needed = total_pred > cur_stock_val
    if reorder_needed:
        shortfall = int(total_pred - cur_stock_val)
        st.markdown(f"""
        <div style="background:rgba(230,57,70,0.07);border:1px solid rgba(230,57,70,0.2);
             border-radius:12px;padding:14px 18px;font-size:13px;color:#1A2E2E;">
          🔔 <b>Reorder Alert:</b> Current stock ({cur_stock_val} units) won't cover
          {periods}-day demand ({int(total_pred)} units).
          <b style="color:{RED};">Shortfall: {shortfall} units.</b>
          &nbsp;→&nbsp;<span style="color:{TEAL};font-weight:600;">📲 Send WhatsApp reorder</span>
        </div>""", unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div style="background:rgba(46,204,113,0.07);border:1px solid rgba(46,204,113,0.2);
             border-radius:12px;padding:14px 18px;font-size:13px;color:#1A2E2E;">
          ✅ <b>Stock sufficient</b> for the {periods}-day forecast.
          Current: <b>{cur_stock_val}</b> · Predicted demand: <b>{int(total_pred)}</b> units.
        </div>""", unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)