import streamlit as st

USERS = {
    "raju@saathi.ai": {"password": "saathi123", "name": "Raju Kumar",  "shop": "Raju Kirana — Kukatpally"},
    "priya@saathi.ai":{"password": "saathi123", "name": "Priya Stores","shop": "Priya General — AS Rao Nagar"},
    "demo":           {"password": "demo",       "name": "Demo User",   "shop": "Demo Shop — Hyderabad"},
}

def render(get_logo_b64):
    logo_b64 = get_logo_b64()
    logo_html = f'<img src="data:image/png;base64,{logo_b64}" style="width:72px;border-radius:20px;box-shadow:0 8px 24px rgba(15,61,62,0.3);">' if logo_b64 else '<span style="font-size:48px">🤝</span>'

    # Decorative teal bg with circles
    st.markdown(f"""
    <style>
    [data-testid="stApp"] {{ background: #0F3D3E !important; }}
    .block-container {{ padding: 0 !important; }}
    </style>
    <div style="position:fixed;inset:0;background:#0F3D3E;z-index:0;">
      <div style="position:absolute;width:500px;height:500px;border-radius:50%;
           background:rgba(79,189,186,0.08);top:-120px;left:-120px;"></div>
      <div style="position:absolute;width:400px;height:400px;border-radius:50%;
           background:rgba(79,189,186,0.06);bottom:-80px;right:-80px;"></div>
      <div style="position:absolute;width:200px;height:200px;border-radius:50%;
           background:rgba(244,196,48,0.06);top:40%;right:20%;"></div>
    </div>
    """, unsafe_allow_html=True)

    col_l, col_c, col_r = st.columns([1, 1.1, 1])
    with col_c:
        st.markdown("<div style='height:80px'></div>", unsafe_allow_html=True)
        st.markdown(f"""
        <div style="background:#fff;border-radius:24px;padding:40px 44px;
             box-shadow:0 32px 80px rgba(0,0,0,0.3);position:relative;z-index:10;">
          <div style="text-align:center;margin-bottom:28px;">
            {logo_html}
            <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:28px;
                 font-weight:800;color:#0F3D3E;margin-top:12px;">Saathi</div>
            <div style="font-size:13px;color:#4A6565;margin-top:3px;">
              Your AI Inventory Companion
            </div>
          </div>
          <div style="background:rgba(79,189,186,0.07);border:1px solid rgba(79,189,186,0.2);
               border-radius:10px;padding:10px 14px;margin-bottom:20px;font-size:12px;color:#1F7A7A;">
            🔑 &nbsp;<b>Quick demo:</b> &nbsp;Username: <code>demo</code> &nbsp;|&nbsp; Password: <code>demo</code>
          </div>
        </div>
        """, unsafe_allow_html=True)

        with st.container():
            st.markdown("""
            <style>
            [data-testid="stApp"] { background: #0F3D3E !important; }
            </style>
            """, unsafe_allow_html=True)

        # Input fields inside the visual card (using st widgets)
        st.markdown('<div style="background:#fff;border-radius:0 0 24px 24px;padding:0 44px 40px;margin-top:-20px;position:relative;z-index:10;box-shadow:0 32px 80px rgba(0,0,0,0.3);">', unsafe_allow_html=True)

        username = st.text_input("Username / Email", placeholder="demo or you@saathi.ai", key="login_user")
        password = st.text_input("Password", type="password", placeholder="Enter your password", key="login_pass")

        col_a, col_b = st.columns([1, 1])
        with col_a:
            st.markdown('<div style="font-size:12px;color:#4A6565;margin-top:4px;">Forgot password?</div>', unsafe_allow_html=True)
        with col_b:
            pass

        st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)

        if st.button("Sign In to Saathi →", key="login_btn"):
            user_data = USERS.get(username.lower())
            if user_data and user_data["password"] == password:
                st.session_state.logged_in = True
                st.session_state.user_name = user_data["name"]
                st.session_state.shop_name = user_data["shop"]
                st.session_state.page = "dashboard"
                st.rerun()
            else:
                st.markdown("""
                <div style="background:rgba(230,57,70,0.08);border:1px solid rgba(230,57,70,0.25);
                     border-radius:10px;padding:10px 14px;font-size:13px;color:#E63946;margin-top:8px;">
                  ❌ &nbsp;Invalid credentials. Try <b>demo / demo</b>
                </div>""", unsafe_allow_html=True)

        st.markdown("""
        <div style="text-align:center;font-size:11px;color:#8AADAD;margin-top:20px;">
          🔒 Secured with 256-bit encryption &nbsp;·&nbsp; Saathi v1.0
        </div>
        </div>
        """, unsafe_allow_html=True)