import pandas as pd

def get_stock_value(inventory_df):
    inventory_df = inventory_df.copy()
    inventory_df["stock_value"] = inventory_df["current_stock"] * inventory_df["cost_price"]
    return inventory_df["stock_value"].sum()


def get_low_stock(inventory_df, threshold=15):
    return inventory_df[inventory_df["current_stock"] <= threshold].copy()


def get_dead_stock(inventory_df, sales_df, dead_days=30):
    sales_df = sales_df.copy()
    inventory_df = inventory_df.copy()

    sales_df["date"] = pd.to_datetime(sales_df["date"], errors="coerce")
    sales_df = sales_df.dropna(subset=["date"])

    inventory_df["product_name"] = inventory_df["product_name"].str.strip()
    sales_df["product_name"]     = sales_df["product_name"].str.strip()

    last_sales = (
        sales_df.groupby("product_name")["date"]
        .max()
        .reset_index()
        .rename(columns={"date": "last_sale_date"})
    )

    merged = pd.merge(inventory_df, last_sales, on="product_name", how="left")
    merged["stock_value"] = merged["current_stock"] * merged["cost_price"]

    merged["last_sale_date"] = merged["last_sale_date"].fillna(
        pd.Timestamp.today() - pd.Timedelta(days=100)
    )
    merged["days_since_sale"] = (pd.Timestamp.today() - merged["last_sale_date"]).dt.days

    dead = merged[merged["days_since_sale"] > dead_days].copy()
    dead = dead.sort_values("days_since_sale", ascending=False)

    return dead[["product_name", "current_stock", "cost_price",
                 "stock_value", "last_sale_date", "days_since_sale"]]