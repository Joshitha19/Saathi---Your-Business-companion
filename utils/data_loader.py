import pandas as pd

def load_inventory():
    return pd.read_csv("data/inventory.csv")

def load_sales():
    return pd.read_csv("data/sales.csv")