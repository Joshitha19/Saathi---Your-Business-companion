import streamlit as st

TEAL="#1F7A7A"; GREEN="#2ECC71"; AMBER="#FFB703"; RED="#E63946"

def render(render_topbar):
    render_topbar("Peer Insights", "How you rank among similar shops in your area")
    st.markdown('<div class="dash-body">', unsafe_allow_html=True)

    st.markdown('<div class="sec-card">', unsafe_allow_html=True)
    st.markdown('<div class="sec-title">🏪 Area Rankings — Kukatpally</div><div class="sec-sub">Based on stock turnover, forecast accuracy & revenue growth</div>', unsafe_allow_html=True)

    peers = [
        ("#1", GREEN, "Sharma General Store",  "₹4.2L/mo", "92%", "12x"),
        ("#2", TEAL,  "Sri Lakshmi Kirana",    "₹3.8L/mo", "88%", "10x"),
        ("#3", AMBER, "Raju Kirana ⭐ YOU",    "₹3.2L/mo", "83%", "9x"),
        ("#4", "#8AB8A8","Ramesh Provisions",  "₹2.9L/mo", "79%", "8x"),
        ("#5", "#8AB8A8","Kumar Super Market", "₹2.4L/mo", "71%", "7x"),
    ]
    rows=""
    for rank,color,name,rev,acc,turn in peers:
        you = "background:rgba(255,183,3,0.06);border-left:3px solid #FFB703;" if "YOU" in name else ""
        rows+=f"""<tr style="{you}">
          <td style="font-size:20px;font-weight:800;color:{color};text-align:center;width:50px;">{rank}</td>
          <td><span class="pname">{name}</span></td>
          <td style="text-align:center;font-weight:600;font-family:'DM Mono',monospace;">{rev}</td>
          <td style="text-align:center;"><span class="tag tag-teal">{acc}</span></td>
          <td style="text-align:center;">{turn}</td>
        </tr>"""
    st.markdown(f"""<table class="s-table">
      <thead><tr><th style="text-align:center;">Rank</th><th>Shop</th>
      <th style="text-align:center;">Monthly Rev</th><th style="text-align:center;">Accuracy</th>
      <th style="text-align:center;">Turnover</th></tr></thead>
      <tbody>{rows}</tbody></table>""", unsafe_allow_html=True)

    st.markdown(f"""
    <div style="background:rgba(255,183,3,0.08);border:1px solid rgba(255,183,3,0.25);
         border-radius:10px;padding:12px 16px;margin-top:14px;font-size:13px;color:#1A2E2E;">
      🤖 <b>AI tip:</b> You're 2 spots away from #1. Reduce dead stock (currently 8 items) to
      improve turnover. Expected improvement: <b style="color:{GREEN};">→ #2 in 30 days</b>
    </div>""", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)