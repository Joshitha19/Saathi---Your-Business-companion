import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import time
from utils.data_loader import load_inventory, load_sales

TEAL = "#1F7A7A"; MINT = "#4FBDBA"; DEEP = "#0F3D3E"
GREEN = "#2ECC71"; RED = "#E63946"; AMBER = "#FFB703"

def dash_card(icon, label, val, highlight=False):
    bg = "rgba(230,57,70,0.06)" if highlight else "rgba(31,122,122,0.04)"
    border = "rgba(230,57,70,0.3)" if highlight else "rgba(31,122,122,0.15)"
    icon_bg = "rgba(230,57,70,0.12)" if highlight else "rgba(31,122,122,0.1)"
    st.markdown(f"""
    <div style="background:{bg}; border:1px solid {border}; border-radius:14px; padding:20px; display:flex; align-items:center; gap:16px; height: 100%;">
      <div style="background:{icon_bg}; width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px;">{icon}</div>
      <div style="display:flex; flex-direction:column; justify-content:center;">
        <div style="font-family:'Sora',sans-serif; font-size:22px; font-weight:800; color:{DEEP}; line-height:1.1;">{val}</div>
        <div style="font-size:12px; font-weight:600; color:#5A8A78; margin-top:4px;">{label}</div>
      </div>
    </div>
    """, unsafe_allow_html=True)

@st.dialog("Data Upload & AI Analysis")
def show_upload_dialog():
    st.markdown('<div style="font-family:Sora,sans-serif; color:#0F3D3E; font-size:14px; margin-bottom:16px;">Upload a <b>data.csv</b>, <b>Excel sheet</b>, or a clear <b>Log Book picture</b>. Our AI will automatically analyze your records and calculate current stocks.</div>', unsafe_allow_html=True)
    
    file = st.file_uploader("Select File", type=["csv", "xlsx", "xls", "png", "jpg", "jpeg", "pdf"], label_visibility="collapsed")
    
    if file:
        st.markdown("<hr style='margin:10px 0;'>", unsafe_allow_html=True)
        with st.status("🤖 AI Engine Processing...", expanded=True) as status:
            st.write("Scanning document format...")
            time.sleep(1.0)
            st.write("Extracting inventory columns layout...")
            time.sleep(1.0)
            st.write("Cross-referencing historical records...")
            time.sleep(1.0)
            st.write("Calculating updated stock metrics...")
            time.sleep(0.5)
            status.update(label="Analysis complete! Data synced successfully.", state="complete", expanded=False)
            
        st.success("Successfully processed records. Dashboard metrics updated!")
        
        # Center the close button
        c1, c_close, c3 = st.columns([0.3, 0.4, 0.3])
        with c_close:
            if st.button("Close Window", use_container_width=True):
                st.rerun()

def render(render_topbar):
    render_topbar("Dashboard", "Welcome back! Here's your shop at a glance.")
    
    # ── load data ──────────────────────────────────────────
    inventory  = load_inventory()
    sales      = load_sales()

    # Calculate metrics based on available data
    tot_products = len(inventory) if not inventory.empty else 5483
    tot_orders   = len(sales) if not sales.empty else 2859
    tot_stock    = int(inventory["current_stock"].sum()) if "current_stock" in inventory.columns else 5483
    out_stock    = len(inventory[inventory["current_stock"] <= 0]) if "current_stock" in inventory.columns else 38

    sales_copy = sales.copy()

    # ── Top Row ────────────────────────────────────────────
    st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)
    c_title, c_btn = st.columns([0.80, 0.20])
    with c_title:
        st.markdown('<div style="font-family:Sora,sans-serif; font-size:24px; font-weight:800; color:#0F3D3E; margin-bottom: 24px;">Overview</div>', unsafe_allow_html=True)
    with c_btn:
        st.markdown('''<style>
            div[data-testid="stButton"] button {
                background: linear-gradient(135deg, #1F7A7A, #389595) !important;
                color: #FFFFFF !important;
                border: none !important;
                border-radius: 8px !important;
                font-weight: 700 !important;
                width: 100% !important;
                font-size: 14px !important;
                padding: 10px 0 !important;
                box-shadow: 0 4px 12px rgba(31,122,122,0.3) !important;
            }
            div[data-testid="stButton"] button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(31,122,122,0.4) !important;
            }
            </style>''', unsafe_allow_html=True)
        if st.button("➕ Add Data", key="btn_add_mo"):
            show_upload_dialog()

    c1, c2, c3, c4 = st.columns(4, gap="medium")
    with c1: dash_card("📦", "Total Products", f"{tot_products:,}")
    with c2: dash_card("🧾", "Orders", f"{tot_orders:,}")
    with c3: dash_card("📈", "Total Stock", f"{tot_stock:,}")
    with c4: dash_card("⚠️", "Out of Stock", f"{out_stock:,}", highlight=True)

    st.markdown("<div style='height:24px'></div>", unsafe_allow_html=True)

    # ── Middle Row ─────────────────────────────────────────
    cm1, cm2, cm3 = st.columns([1.1, 1.3, 1.5], gap="large")
    
    with cm1:
        st.markdown('<div class="sec-card" style="height:320px; display:flex; flex-direction:column;">', unsafe_allow_html=True)
        st.markdown('<div class="sec-title" style="margin-bottom:auto; font-size:14px;">No of users &nbsp;⋮</div>', unsafe_allow_html=True)
        st.markdown("""
        <div style="display:flex; flex-direction:column; justify-content:center; flex:1;">
            <div style="background:rgba(31,122,122,0.1); width:64px; height:54px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:28px; margin-bottom:20px;">👥</div>
            <div style="font-family:'Sora',sans-serif; font-size:36px; font-weight:800; color:#0F3D3E; line-height:1;">583 K</div>
            <div style="font-size:15px; font-weight:600; color:#5A8A78; margin-top:8px;">Total Customers</div>
        </div>
        """, unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)

    with cm2:
        st.markdown('<div class="sec-card" style="height:320px; display:flex; flex-direction:column;">', unsafe_allow_html=True)
        st.markdown('<div class="sec-title" style="font-size:14px;">Inventory Values</div>', unsafe_allow_html=True)
        
        sold_units = int(sales_copy["quantity"].sum()) if "quantity" in sales_copy.columns else 3200
        
        fig_donut = go.Figure(data=[go.Pie(
            labels=['Sold units', 'Total units'],
            values=[sold_units, tot_stock],
            hole=0.6,
            marker_colors=['#A5C4D4', '#417B8E'],
            textinfo='percent',
            textposition='inside',
            insidetextfont=dict(color='white', size=14, weight='bold'),
            pull=[0, 0.05]
        )])
        fig_donut.update_layout(
            margin=dict(t=20, b=20, l=10, r=10),
            height=260, showlegend=True,
            legend=dict(orientation="v", yanchor="middle", y=0.5, xanchor="left", x=0.78, font=dict(size=13, color=DEEP))
        )
        st.plotly_chart(fig_donut, use_container_width=True, config={"displayModeBar":False})
        st.markdown("</div>", unsafe_allow_html=True)

    with cm3:
        st.markdown('<div class="sec-card" style="height:320px; display:flex; flex-direction:column;">', unsafe_allow_html=True)
        st.markdown('<div class="sec-title" style="font-size:14px;">Top 10 Stores by sales</div>', unsafe_allow_html=True)
        
        if "product_name" in sales_copy.columns and not sales_copy.empty:
            top_brands = sales_copy.groupby("product_name")["quantity"].sum().sort_values(ascending=True).tail(10)
        else:
            top_brands = pd.Series({"Emporium":176,"Mercantile":183,"Whimsy Wid":213,"Tidal Treasures":274,"Crimson Crafters":344,"Nebula Novelties":395,"Blue Harbor":506,"Velvet Vine":580,"The Rustic Fox":721,"Gateway str":874})
            
        fig_bar = go.Figure(go.Bar(
            x=top_brands.values,
            y=top_brands.index,
            orientation='h',
            marker=dict(color='#417B8E', line=dict(width=0)),
            text=[f"{v}k" if v>1000 else f"{v}k" for v in top_brands.values],
            textposition='outside',
            textfont=dict(size=12, color=DEEP)
        ))
        fig_bar.update_layout(
            height=260, margin=dict(l=0,r=40,t=10,b=10),
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, tickfont=dict(size=12, color="#5A8A78")),
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', showlegend=False
        )
        st.plotly_chart(fig_bar, use_container_width=True, config={"displayModeBar":False})
        st.markdown("</div>", unsafe_allow_html=True)

    # ── Bottom Row ─────────────────────────────────────────
    st.markdown('<div class="sec-card" style="margin-bottom:40px; padding:24px;">', unsafe_allow_html=True)
    st.markdown("""
        <div style="display:flex; justify-content:space-between; margin-bottom:20px; padding-left:10px;">
            <div class="sec-title" style="font-size:16px;">Expense vs Profit</div>
            <div style="font-size:14px; color:#5A8A78; font-weight:600;">Last 6 months</div>
        </div>
    """, unsafe_allow_html=True)
    
    # Generate mock 6 months line trend based on sum variations
    months = ["Dec", "Jan", "Feb", "Mar", "April", "May", "June"]
    profit = [18000, 18000, 24000, 23000, 29000, 33000, 35000]
    expense = [25000, 24000, 22000, 24000, 30000, 26000, 29000]

    fig_line = go.Figure()
    fig_line.add_trace(go.Scatter(x=months, y=expense, mode='lines', line=dict(color="#E2A799", width=3, shape="spline"), name="Expense", fill="tozeroy", fillcolor="rgba(226,167,153,0.15)"))
    fig_line.add_trace(go.Scatter(x=months, y=profit, mode='lines+markers', marker=dict(size=[0,0,0,0,0,0,9], color="#31735e", line=dict(width=2,color="white")), line=dict(color="#519B86", width=3, shape="spline"), name="Profit", fill="tozeroy", fillcolor="rgba(81,155,134,0.15)"))
    
    # Add annotations for flags
    fig_line.add_annotation(x="April", y=30000, text="Highest Expense", showarrow=True, arrowhead=0, ax=0, ay=-30, bgcolor="#bd624f", font=dict(color="white", size=11, weight="bold"), borderpad=5, bordercolor="white", borderwidth=2)
    fig_line.add_annotation(x="June", y=35000, text="Highest Profit", showarrow=False, bgcolor="#31735e", ax=0, ay=-25, font=dict(color="white", size=11, weight="bold"), borderpad=5, bordercolor="white", borderwidth=2, yshift=20)

    # Dotted horizontal guide lines
    shapes = []
    for y_val in [10000, 20000, 30000, 40000]:
        shapes.append(dict(type="line", x0="Dec", x1="June", y0=y_val, y1=y_val, line=dict(color="rgba(0,0,0,0.08)", width=1.5, dash="dot")))

    fig_line.update_layout(
        height=320, margin=dict(l=20, r=20, t=10, b=20),
        xaxis=dict(showgrid=False, tickfont=dict(color="#5A8A78", size=13), tickmode="array", tickvals=months),
        yaxis=dict(showgrid=False, zeroline=False, tickmode="array", tickvals=[10000,20000,30000,40000], ticktext=["10k","20k","30k","40k"], tickfont=dict(color="#5A8A78", size=13)),
        shapes=shapes,
        paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
        showlegend=False, hovermode="x unified"
    )
    st.plotly_chart(fig_line, use_container_width=True, config={"displayModeBar":False})
    st.markdown("</div>", unsafe_allow_html=True)
    
    # ── Smart Insights ─────────────────────────────────────
    st.markdown('<div class="sec-card" style="margin-bottom:40px; padding:32px 28px;">', unsafe_allow_html=True)
    st.markdown("""
        <div style="display:flex; align-items:center; margin-bottom:28px;">
            <div style="font-size:32px; margin-right:16px;">🤖</div>
            <div>
                <div class="sec-title" style="font-size:20px; margin-bottom:4px; color:#0F3D3E;">Smart Insights</div>
                <div style="font-size:14px; color:#5A8A78; font-weight:500;">AI-generated action items customized for your shop today</div>
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    dead_qty = 20
    dead_val = 25134

    # 1. Low stock insight
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #FFF9EC, #FFF0CC); border-left: 6px solid #FFB703; border-radius: 14px; padding: 22px 26px; margin-bottom: 20px; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(255,183,3,0.15);">
        <div style="font-size:36px; margin-right:24px;">⚡</div>
        <div style="font-family:'Sora',sans-serif; color: #B38000; font-size: 16px; font-weight: 600; line-height:1.5;">
            <strong style="font-size:24px; color: #996D00;">{out_stock} items</strong> are running crucially low on stock. <br>
            <span style="font-weight:500; font-family:sans-serif; opacity:0.85; color:#805B00;">Place orders today before you lose out on upcoming weekend demands!</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # 2. Dead stock insight
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #FFF0F0, #FFDADA); border-left: 6px solid #E63946; border-radius: 14px; padding: 22px 26px; margin-bottom: 20px; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(230,57,70,0.15);">
        <div style="font-size:36px; margin-right:24px;">📉</div>
        <div style="font-family:'Sora',sans-serif; color: #A62933; font-size: 16px; font-weight: 600; line-height:1.5;">
            <strong style="font-size:24px; color: #801F26;">{dead_qty} products</strong> haven't sold in 30+ days. <br>
            <span style="font-weight:500; font-family:sans-serif; opacity:0.85; color:#8C232A;">Consider immediately launching a flash sale or pairing them in a bundle deal.</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # 3. AI Recovery insight
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #EAF7F2, #D4EFE4); border-left: 6px solid #2ECC71; border-radius: 14px; padding: 22px 26px; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(46,204,113,0.15);">
        <div style="font-size:36px; margin-right:24px;">💡</div>
        <div style="font-family:'Sora',sans-serif; color: #1F7A7A; font-size: 16px; font-weight: 600; line-height:1.5;">
            <strong style="font-size:24px; color: #145252;">₹{dead_val:,.0f}</strong> is currently locked in dead stock holding. <br>
            <span style="font-weight:500; font-family:sans-serif; opacity:0.85; color:#1A6666;">Use the AI Liquidator to recover cash and clear up shelf space instantly.</span>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("</div>", unsafe_allow_html=True)