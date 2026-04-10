import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from utils.data_loader import load_inventory, load_sales
from utils.inventory_logic import get_low_stock, get_dead_stock
 
TEAL="#1F7A7A"; MINT="#4FBDBA"; RED="#E63946"; GREEN="#2ECC71"; AMBER="#FFB703"; ORANGE="#F77F00"
 
 
# ── ALERTS ────────────────────────────────────────────────────────────────────
def render(render_topbar):
    render_topbar("Smart Alerts", "AI-powered reorder triggers, expiry warnings & event spikes")
    st.markdown('<div class="dash-body">', unsafe_allow_html=True)
 
    inventory = load_inventory()
    sales     = load_sales()
    low       = get_low_stock(inventory)
    dead      = get_dead_stock(inventory, sales)
 
    alerts = []
    for _, r in low.iterrows():
        alerts.append({"icon":"🔴","bg":"rgba(230,57,70,0.1)",
                        "title":f"Low Stock: {r['product_name']}",
                        "desc":f"Only {int(r['current_stock'])} units remaining. Reorder now to avoid stockout.",
                        "sev":"Critical","action":"📲 Reorder"})
    for _, r in dead.iterrows():
        alerts.append({"icon":"🟡","bg":"rgba(255,183,3,0.1)",
                        "title":f"Dead Stock: {r['product_name']}",
                        "desc":f"{int(r.get('days_since_sale',0))} days no sales. ₹{r.get('stock_value',0):,.0f} locked. Apply discount.",
                        "sev":"Warning","action":"♻️ Apply Discount"})
    alerts += [
        {"icon":"🟢","bg":"rgba(46,204,113,0.1)","title":"Forecast Updated","desc":"14-day demand forecast refreshed for all SKUs. Accuracy: 83%.","sev":"Info","action":"📈 View Forecast"},
        {"icon":"🟠","bg":"rgba(247,127,0,0.1)","title":"Ugadi Spike Alert","desc":"Ugadi on Mar 30. Stock up Grocery & Snacks — demand +180%.","sev":"Warning","action":"📦 Stock Up"},
    ]
 
    critical = sum(1 for a in alerts if a["sev"]=="Critical")
    warning  = sum(1 for a in alerts if a["sev"]=="Warning")
    info     = sum(1 for a in alerts if a["sev"]=="Info")
 
    c1,c2,c3 = st.columns(3, gap="medium")
    for col,(val,label,bg,dc) in zip([c1,c2,c3],[
        (str(critical),"Critical","rgba(230,57,70,0.1)","d-down"),
        (str(warning),"Warnings","rgba(255,183,3,0.12)","d-warn"),
        (str(info),"Info","rgba(46,204,113,0.1)","d-up"),
    ]):
        with col:
            st.markdown(f'<div class="kpi-card"><div class="kpi-val">{val}</div><div class="kpi-lbl">{label}</div></div>', unsafe_allow_html=True)
 
    st.markdown("<div style='height:18px'></div>", unsafe_allow_html=True)
    st.markdown('<div class="sec-card">', unsafe_allow_html=True)
    st.markdown('<div class="sec-title">🔔 All Alerts</div><div class="sec-sub">Sorted by urgency</div>', unsafe_allow_html=True)
 
    filt = st.selectbox("Filter", ["All","Critical","Warning","Info"])
    for a in alerts:
        if filt != "All" and a["sev"] != filt: continue
        st.markdown(f"""
        <div style="display:flex;align-items:flex-start;gap:12px;padding:13px 0;border-bottom:1px solid rgba(31,122,122,0.07);">
          <div style="width:36px;height:36px;border-radius:10px;background:{a['bg']};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">{a['icon']}</div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:600;color:#1A2E2E;">{a['title']}</div>
            <div style="font-size:12px;color:#5A8A78;margin-top:2px;">{a['desc']}</div>
            <span style="display:inline-block;margin-top:6px;background:rgba(31,122,122,0.1);color:{TEAL};font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;">{a['action']}</span>
          </div>
          <div style="font-size:11px;color:#8AB8A8;white-space:nowrap;font-family:'DM Mono',monospace;">{a['sev']}</div>
        </div>""", unsafe_allow_html=True)
 
    st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)