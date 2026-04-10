import streamlit as st

TEAL = "#1F7A7A"; MINT = "#4FBDBA"; GREEN = "#2ECC71"

def render(render_topbar):
    render_topbar("Settings", "Manage your shop profile, thresholds and preferences")
    st.markdown('<div class="dash-body">', unsafe_allow_html=True)

    # ── Shop Profile ───────────────────────────────────────
    st.markdown('<div class="sec-card">', unsafe_allow_html=True)
    st.markdown('<div class="sec-title">🏪 Shop Profile</div><div class="sec-sub">Update your store information</div>', unsafe_allow_html=True)

    c1, c2 = st.columns(2, gap="medium")
    with c1:
        st.text_input("Shop Name",     value="Raju Kirana Store",    key="s_shopname")
        st.text_input("Owner Name",    value="Raju Kumar",           key="s_owner")
        st.text_input("Phone Number",  value="+91 98765 43210",      key="s_phone")
    with c2:
        st.text_input("Location",      value="Kukatpally, Hyderabad",key="s_loc")
        st.text_input("GSTIN",         value="36AAAAA0000A1Z5",      key="s_gstin")
        st.text_input("Email",         value="raju@saathi.ai",       key="s_email")

    if st.button("💾 Save Profile", key="save_profile"):
        st.success("✅ Profile saved successfully!")
    st.markdown("</div>", unsafe_allow_html=True)

    # ── AI Thresholds ──────────────────────────────────────
    st.markdown('<div class="sec-card">', unsafe_allow_html=True)
    st.markdown('<div class="sec-title">🤖 AI Thresholds</div><div class="sec-sub">Tune when alerts and flags are triggered</div>', unsafe_allow_html=True)

    c3, c4 = st.columns(2, gap="medium")
    with c3:
        low_thresh = st.slider("Low Stock Threshold (units)", 5, 50, 15,
            help="Items below this count trigger a Low Stock alert")
        dead_thresh = st.slider("Dead Stock Threshold (days)", 7, 90, 30,
            help="Items with no sales beyond this many days are flagged")
    with c4:
        forecast_days = st.slider("Forecast Horizon (days)", 7, 30, 14,
            help="How many days ahead the AI forecasts demand")
        reorder_lead  = st.slider("Supplier Lead Time (days)", 1, 14, 3,
            help="How many days your supplier takes to deliver")

    st.markdown(f"""
    <div style="background:rgba(79,189,186,0.07);border:1px solid rgba(79,189,186,0.2);
         border-radius:10px;padding:11px 15px;font-size:12px;color:{TEAL};margin-top:8px;">
      🔔 &nbsp;Saathi will alert you when stock drops below <b>{low_thresh} units</b>,
      flag products unsold for <b>{dead_thresh}+ days</b>, and forecast
      <b>{forecast_days} days ahead</b> accounting for <b>{reorder_lead}-day</b> supplier lead time.
    </div>""", unsafe_allow_html=True)

    if st.button("💾 Save Thresholds", key="save_thresh"):
        st.session_state["low_thresh"]   = low_thresh
        st.session_state["dead_thresh"]  = dead_thresh
        st.session_state["forecast_days"]= forecast_days
        st.success("✅ Thresholds updated!")
    st.markdown("</div>", unsafe_allow_html=True)

    # ── Notification Preferences ───────────────────────────
    st.markdown('<div class="sec-card">', unsafe_allow_html=True)
    st.markdown('<div class="sec-title">🔔 Notifications</div><div class="sec-sub">Choose how Saathi alerts you</div>', unsafe_allow_html=True)

    c5, c6 = st.columns(2, gap="medium")
    with c5:
        st.checkbox("WhatsApp alerts for low stock",    value=True,  key="notif_wa_low")
        st.checkbox("WhatsApp alerts for dead stock",   value=True,  key="notif_wa_dead")
        st.checkbox("WhatsApp festival spike warnings", value=True,  key="notif_wa_fest")
    with c6:
        st.checkbox("Email daily summary report",       value=False, key="notif_email_daily")
        st.checkbox("Email weekly analytics digest",    value=True,  key="notif_email_weekly")
        st.checkbox("SMS critical alerts only",         value=False, key="notif_sms")

    wa_num = st.text_input("WhatsApp Number for Alerts", value="+91 98765 43210", key="wa_num")
    if st.button("💾 Save Notifications", key="save_notif"):
        st.success("✅ Notification preferences saved!")
    st.markdown("</div>", unsafe_allow_html=True)

    # ── Data Management ────────────────────────────────────
    st.markdown('<div class="sec-card">', unsafe_allow_html=True)
    st.markdown('<div class="sec-title">📁 Data Management</div><div class="sec-sub">Import, export and manage your inventory data</div>', unsafe_allow_html=True)

    c7, c8 = st.columns(2, gap="medium")
    with c7:
        st.markdown('<div style="font-size:12px;font-weight:600;color:#5A8A78;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em;">Import Data</div>', unsafe_allow_html=True)
        uploaded_inv  = st.file_uploader("Upload Inventory CSV",  type=["csv"], key="up_inv")
        uploaded_sale = st.file_uploader("Upload Sales CSV",      type=["csv"], key="up_sale")
        if uploaded_inv:
            st.success(f"✅ Inventory file ready: {uploaded_inv.name}")
        if uploaded_sale:
            st.success(f"✅ Sales file ready: {uploaded_sale.name}")

    with c8:
        st.markdown('<div style="font-size:12px;font-weight:600;color:#5A8A78;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em;">Export Data</div>', unsafe_allow_html=True)
        import pandas as pd
        try:
            inv  = pd.read_csv("data/inventory.csv")
            sale = pd.read_csv("data/sales.csv")
            st.download_button(
                "⬇️ Download Inventory CSV", inv.to_csv(index=False),
                "inventory_export.csv", "text/csv", key="dl_inv"
            )
            st.download_button(
                "⬇️ Download Sales CSV", sale.to_csv(index=False),
                "sales_export.csv", "text/csv", key="dl_sale"
            )
        except Exception:
            st.info("No data files found to export.")

    st.markdown("</div>", unsafe_allow_html=True)

    # ── App Info ───────────────────────────────────────────
    st.markdown(f"""
    <div style="background:rgba(31,122,122,0.05);border:1px solid rgba(31,122,122,0.12);
         border-radius:14px;padding:18px 22px;display:flex;align-items:center;gap:16px;">
      <div style="font-size:32px;">🤝</div>
      <div>
        <div style="font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:#0F3D3E;">Saathi v1.0</div>
        <div style="font-size:12px;color:#5A8A78;margin-top:2px;">AI Inventory Intelligence · Built for Indian SMEs</div>
        <div style="font-size:11px;color:#8AB8A8;margin-top:4px;">
          Powered by Prophet ML · Streamlit · Python · Made with ❤️ in Hyderabad
        </div>
      </div>
      <div style="margin-left:auto;text-align:right;">
        <div style="font-size:11px;color:#8AB8A8;">Support</div>
        <div style="font-size:13px;font-weight:600;color:{TEAL};">support@saathi.ai</div>
      </div>
    </div>""", unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)