import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from utils.data_loader import load_inventory, load_sales

TEAL="#1F7A7A"; MINT="#4FBDBA"; RED="#E63946"; GREEN="#2ECC71"; AMBER="#FFB703"

def render(render_topbar):
    render_topbar("Inventory", "Real-time stock levels for all products")
    st.markdown('<div class="dash-body">', unsafe_allow_html=True)

    inventory = load_inventory()
    sales     = load_sales()

    sales["date"] = pd.to_datetime(sales["date"], errors="coerce")
    avg_daily = sales.dropna(subset=["date"]).groupby("product_name")["quantity"].mean().reset_index()
    avg_daily.columns = ["product_name", "avg_daily"]

    inv = inventory.merge(avg_daily, on="product_name", how="left")
    inv["avg_daily"]     = inv["avg_daily"].fillna(0.5)
    inv["days_of_stock"] = (inv["current_stock"] / inv["avg_daily"].clip(lower=0.1)).round(1)
    inv["stock_value"]   = inv["current_stock"] * inv["cost_price"]
    inv["status"]        = inv["days_of_stock"].apply(
        lambda d: "Critical" if d < 5 else ("Low" if d < 10 else ("OK" if d < 60 else "Overstock"))
    )

    c1,c2,c3,c4 = st.columns(4, gap="medium")
    ok   = len(inv[inv["status"]=="OK"])
    crit = len(inv[inv["status"]=="Critical"])
    low  = len(inv[inv["status"]=="Low"])
    tval = inv["stock_value"].sum()
    for col,(icon,bg,val,label) in zip([c1,c2,c3,c4],[
        ("✅","rgba(46,204,113,0.1)",str(ok),"Healthy stock"),
        ("🔴","rgba(230,57,70,0.1)",str(crit),"Critical (<5d)"),
        ("🟡","rgba(255,183,3,0.12)",str(low),"Low stock"),
        ("💰","rgba(31,122,122,0.1)",f"₹{tval:,.0f}","Total value"),
    ]):
        with col:
            st.markdown(f'<div class="kpi-card"><div class="kpi-icon" style="background:{bg};">{icon}</div><div class="kpi-val">{val}</div><div class="kpi-lbl">{label}</div></div>', unsafe_allow_html=True)

    st.markdown("<div style='height:18px'></div>", unsafe_allow_html=True)

    col_a, col_b = st.columns([1,1.5], gap="medium")
    with col_a:
        st.markdown('<div class="sec-card">', unsafe_allow_html=True)
        st.markdown('<div class="sec-title">📊 Stock Health</div>', unsafe_allow_html=True)
        sc = inv["status"].value_counts()
        cmap = {"OK":GREEN,"Low":AMBER,"Critical":RED,"Overstock":TEAL}
        fig = go.Figure(go.Pie(
            labels=sc.index, values=sc.values, hole=0.55,
            marker=dict(colors=[cmap.get(s,MINT) for s in sc.index], line=dict(color="#fff",width=2)),
            textinfo="label+value", textfont=dict(size=11),
        ))
        fig.update_layout(height=200, margin=dict(l=0,r=0,t=0,b=0),
                          paper_bgcolor="rgba(0,0,0,0)", showlegend=False)
        st.plotly_chart(fig, use_container_width=True, config={"displayModeBar":False})
        st.markdown("</div>", unsafe_allow_html=True)

    with col_b:
        st.markdown('<div class="sec-card">', unsafe_allow_html=True)
        st.markdown('<div class="sec-title">📦 All Products</div>', unsafe_allow_html=True)
        cat_f = st.selectbox("Status filter", ["All","Critical","Low","OK","Overstock"])
        filtered = inv if cat_f=="All" else inv[inv["status"]==cat_f]
        stmap = {"Critical":"tag-red","Low":"tag-amber","OK":"tag-green","Overstock":"tag-teal"}
        rows = ""
        for _, r in filtered.iterrows():
            rows += f"""<tr>
              <td><span class="pname">{r['product_name']}</span></td>
              <td style="text-align:center;">{int(r['current_stock'])}</td>
              <td style="text-align:center;">{r['days_of_stock']:.0f}d</td>
              <td style="text-align:center;"><span class="tag {stmap.get(r['status'],'tag-teal')}">{r['status']}</span></td>
              <td style="text-align:right;font-family:'DM Mono',monospace;font-size:12px;">₹{r['stock_value']:,.0f}</td>
            </tr>"""
        st.markdown(f"""<table class="s-table">
          <thead><tr><th>Product</th><th style="text-align:center;">Units</th>
          <th style="text-align:center;">Days Left</th><th style="text-align:center;">Status</th>
          <th style="text-align:right;">Value</th></tr></thead>
          <tbody>{rows}</tbody></table>""", unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)