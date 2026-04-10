import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from utils.data_loader import load_inventory, load_sales
from utils.inventory_logic import get_dead_stock

RED="#E63946"; AMBER="#FFB703"; GREEN="#2ECC71"; TEAL="#1F7A7A"; MINT="#4FBDBA"

def render(render_topbar):
    render_topbar("Dead Stock Scanner", "AI identifies locked capital and suggests recovery strategies")
    st.markdown('<div class="dash-body">', unsafe_allow_html=True)

    inventory = load_inventory()
    sales     = load_sales()
    dead      = get_dead_stock(inventory, sales)

    if dead.empty:
        st.markdown('<div class="sec-card"><div class="sec-title">✅ No Dead Stock</div><div class="sec-sub">All products have recent sales activity.</div></div>', unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)
        return

    total_locked  = dead["stock_value"].sum()
    recoverable   = total_locked * 0.65
    critical_cnt  = len(dead[dead["days_since_sale"] > 60])

    c1,c2,c3,c4 = st.columns(4, gap="medium")
    for col,(icon,bg,val,label,delta,dt) in zip([c1,c2,c3,c4],[
        ("💀","rgba(230,57,70,0.1)",str(len(dead)),"Dead items","30+ days no sales","down"),
        ("💰","rgba(230,57,70,0.08)",f"₹{total_locked:,.0f}","Capital locked","Tied in unsold stock","down"),
        ("🔥","rgba(247,127,0,0.1)",str(critical_cnt),"Critical (60d+)","Urgent action needed","down"),
        ("♻️","rgba(46,204,113,0.1)",f"₹{recoverable:,.0f}","Recoverable","With AI suggestions","up"),
    ]):
        with col:
            dc = "d-up" if dt=="up" else "d-down"
            arr = "▲" if dt=="up" else "▼"
            st.markdown(f"""<div class="kpi-card">
              <div class="kpi-icon" style="background:{bg};">{icon}</div>
              <div class="kpi-val">{val}</div>
              <div class="kpi-lbl">{label}</div>
              <div class="kpi-delta {dc}">{arr} {delta}</div>
            </div>""", unsafe_allow_html=True)

    st.markdown("<div style='height:18px'></div>", unsafe_allow_html=True)

    col_l, col_r = st.columns([1.5, 1], gap="medium")
    with col_l:
        st.markdown('<div class="sec-card">', unsafe_allow_html=True)
        st.markdown('<div class="sec-title">💰 Capital Locked by Product</div><div class="sec-sub">Top items with most money tied up</div>', unsafe_allow_html=True)
        top10 = dead.sort_values("stock_value", ascending=True).tail(10)
        clrs  = [RED if d > 60 else AMBER for d in top10["days_since_sale"]]
        fig = go.Figure(go.Bar(
            y=top10["product_name"], x=top10["stock_value"],
            orientation="h", marker_color=clrs,
            text=[f"₹{v:,.0f}" for v in top10["stock_value"]],
            textposition="auto",
            hovertemplate="<b>%{y}</b><br>₹%{x:,.0f}<extra></extra>"
        ))
        fig.update_layout(height=260,margin=dict(l=0,r=0,t=4,b=0),
                          paper_bgcolor="rgba(0,0,0,0)",plot_bgcolor="rgba(0,0,0,0)",
                          xaxis=dict(tickprefix="₹",tickfont=dict(size=10,color="#8AB8A8")),
                          yaxis=dict(tickfont=dict(size=11,color="#4A6565")),showlegend=False)
        st.plotly_chart(fig, use_container_width=True, config={"displayModeBar":False})
        st.markdown("</div>", unsafe_allow_html=True)

    with col_r:
        st.markdown('<div class="sec-card">', unsafe_allow_html=True)
        st.markdown('<div class="sec-title">📊 Idle Days Distribution</div>', unsafe_allow_html=True)
        buckets = pd.cut(dead["days_since_sale"], bins=[30,60,90,120,9999],
                         labels=["30–60d","60–90d","90–120d","120d+"])
        bc = buckets.value_counts().sort_index()
        fig2 = go.Figure(go.Bar(
            x=bc.index.astype(str), y=bc.values,
            marker_color=[MINT, AMBER, RED, "#8B0000"],
            text=bc.values, textposition="outside",
        ))
        fig2.update_layout(height=180,margin=dict(l=0,r=0,t=4,b=0),
                           paper_bgcolor="rgba(0,0,0,0)",plot_bgcolor="rgba(0,0,0,0)",
                           xaxis=dict(tickfont=dict(size=11,color="#4A6565")),
                           yaxis=dict(showgrid=True,gridcolor="rgba(31,122,122,0.08)",tickfont=dict(size=10,color="#8AB8A8")),
                           showlegend=False)
        st.plotly_chart(fig2, use_container_width=True, config={"displayModeBar":False})

        pct = int(recoverable / total_locked * 100)
        st.markdown(f"""
        <div style="margin-top:10px;">
          <div style="font-size:12px;font-weight:600;color:#5A8A78;margin-bottom:5px;">Recovery Potential</div>
          <div class="prog-wrap"><div class="prog-fill" style="width:{pct}%;background:linear-gradient(90deg,{GREEN},{MINT});"></div></div>
          <div style="font-size:12px;color:{GREEN};margin-top:4px;font-weight:600;">{pct}% recoverable with discounts</div>
        </div>""", unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)

    # Full table
    st.markdown('<div class="sec-card">', unsafe_allow_html=True)
    st.markdown('<div class="sec-title">🗂️ All Dead Stock Items</div><div class="sec-sub">Complete list with AI recovery suggestions</div>', unsafe_allow_html=True)

    rows = ""
    for _, r in dead.iterrows():
        days = int(r["days_since_sale"])
        sev  = "tag-red" if days > 60 else "tag-amber"
        action = "30% off" if days < 60 else ("40% off + bundle" if days < 90 else "Bundle deal")
        rows += f"""<tr>
          <td><span class="pname">{r['product_name']}</span></td>
          <td style="text-align:center;"><span class="tag {sev}">{days}d</span></td>
          <td style="text-align:center;">{int(r['current_stock'])} units</td>
          <td style="text-align:right;font-family:'DM Mono',monospace;color:{RED};">₹{r['stock_value']:,.0f}</td>
          <td style="text-align:right;"><span class="tag tag-teal">{action}</span></td>
        </tr>"""

    st.markdown(f"""<table class="s-table">
      <thead><tr><th>Product</th><th style="text-align:center;">Days Idle</th>
      <th style="text-align:center;">Stock</th><th style="text-align:right;">Locked ₹</th>
      <th style="text-align:right;">AI Action</th></tr></thead>
      <tbody>{rows}</tbody></table>""", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)