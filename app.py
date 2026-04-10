import streamlit as st
import base64
from pathlib import Path

st.set_page_config(
    page_title="Saathi — Inventory Intelligence",
    page_icon="💚",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── logo ──────────────────────────────────────────────────────────────────────
def get_logo_b64():
    for p in ["logo.png", "assets/logo.png"]:
        f = Path(p)
        if f.exists():
            return base64.b64encode(f.read_bytes()).decode()
    return ""

LOGO_B64 = get_logo_b64()
LOGO_SRC = f"data:image/png;base64,{LOGO_B64}" if LOGO_B64 else ""

# ── session state ─────────────────────────────────────────────────────────────
for key, default in [
    ("logged_in", False),
    ("active_page", "dashboard"),
    ("user_name", ""),
    ("shop_name", ""),
]:
    if key not in st.session_state:
        st.session_state[key] = default

# ══════════════════════════════════════════════════════════════════════════════
# GLOBAL CSS
# ══════════════════════════════════════════════════════════════════════════════
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Sora:wght@600;700;800&family=DM+Mono:wght@400;500&display=swap');

/* ── palette variables ── */
:root {
  --deep:   #0F3D3E;
  --teal:   #1F7A7A;
  --mint:   #4FBDBA;
  --mint2:  #5ECBAD;
  --yellow: #F4C430;
  --orange: #F77F00;
  --red:    #E63946;
  --amber:  #FFB703;
  --green:  #2ECC71;
  --bg:     #F2F7F5;
  --white:  #FFFFFF;
  --border: #DFF0E8;
  --tmid:   #5A8A78;
  --tlight: #8AB8A8;
}

/* ── reset & base ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { font-family: 'DM Sans', sans-serif; }

/* ── hide streamlit chrome ── */
#MainMenu, footer, header,
[data-testid="stToolbar"],
[data-testid="stDecoration"],
[data-testid="stHeader"],
[data-testid="collapsedControl"],
section[data-testid="stSidebar"] { display: none !important; visibility: hidden !important; }

.block-container { padding: 0 !important; max-width: 100% !important; }
[data-testid="stVerticalBlock"] { gap: 0 !important; }

/* ── inputs ── */
[data-testid="stTextInput"] label {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 11px !important; font-weight: 600 !important;
  letter-spacing: .05em !important; text-transform: uppercase !important;
}
[data-testid="stTextInput"] > div > div > input {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 14px !important;
  border-radius: 12px !important;
  padding: 11px 16px !important;
  transition: all .18s !important;
}

/* ── base button reset (overridden per-page) ── */
.stButton > button {
  font-family: 'Sora', sans-serif !important;
  font-size: 14px !important; font-weight: 700 !important;
  border-radius: 12px !important;
  padding: 12px 20px !important;
  transition: all .2s !important;
  cursor: pointer !important;
  width: 100% !important;
}

/* ── tabs ── */
div.stTabs [data-baseweb="tab-list"] {
  background: rgba(255,255,255,0.12) !important;
  border-radius: 14px !important;
  padding: 4px !important;
  gap: 3px !important;
  border-bottom: none !important;
}
div.stTabs [data-baseweb="tab"] {
  flex: 1 !important; border-radius: 10px !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 13px !important; font-weight: 600 !important;
  color: rgba(255,255,255,0.6) !important;
  border: none !important; padding: 9px 14px !important;
}
div.stTabs [aria-selected="true"] {
  background: rgba(255,255,255,0.95) !important;
  color: var(--deep) !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15) !important;
}
div.stTabs [data-baseweb="tab-border"] { display: none !important; }
div.stTabs [role="tabpanel"] { padding-top: 20px !important; }

/* ── dataframe styling ── */
[data-testid="stDataFrame"] > div { border-radius: 14px !important; overflow: hidden !important; }
[data-testid="stDataFrame"] table { font-family: 'DM Sans', sans-serif !important; font-size: 13px !important; }
[data-testid="stDataFrame"] th {
  background: #EAF5EE !important; color: var(--teal) !important;
  font-size: 11px !important; font-weight: 700 !important;
  text-transform: uppercase !important; letter-spacing: .05em !important;
}

/* ── alerts ── */
[data-testid="stAlert"] { border-radius: 12px !important; font-family: 'DM Sans', sans-serif !important; }

/* ── selectbox ── */
[data-testid="stSelectbox"] > div > div {
  border-radius: 10px !important;
  font-family: 'DM Sans', sans-serif !important;
}

/* ── spinner ── */
.stSpinner > div { border-top-color: var(--teal) !important; }

/* ═══════════════════════════════════
   LOGIN PAGE STYLES
═══════════════════════════════════ */
.login-bg {
  min-height: 100vh;
  background: var(--deep);
  position: relative;
  overflow: hidden;
}
.login-blob1 {
  position: fixed; width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(79,189,186,0.12), transparent 70%);
  top: -120px; left: -100px; pointer-events: none; z-index: 0;
}
.login-blob2 {
  position: fixed; width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(94,203,173,0.08), transparent 70%);
  bottom: -80px; right: -80px; pointer-events: none; z-index: 0;
}
.login-blob3 {
  position: fixed; width: 250px; height: 250px; border-radius: 50%;
  background: radial-gradient(circle, rgba(244,196,48,0.05), transparent 70%);
  top: 40%; right: 25%; pointer-events: none; z-index: 0;
}

/* split card */
.login-split {
  display: flex; width: 100vw; min-height: 100vh;
  position: fixed; top: 0; left: 0; z-index: 0; pointer-events: none;
}

/* LEFT white panel */
.login-left {
  width: 46%;
  min-height: 100vh;
  background: var(--white);
  border-radius: 0 56px 56px 0;
  clip-path: ellipse(108% 100% at 0% 50%);
  display: flex; flex-direction: column;
  padding: 32px 40px 28px;
  box-shadow: 8px 0 48px rgba(0,0,0,0.22);
  overflow: hidden;
}
.ll-logo { display: flex; align-items: center; gap: 14px; z-index: 2; position: relative; }
.ll-logo img { width: 68px; height: 68px; object-fit: contain; border: none !important; box-shadow: none !important; }
.ll-logo-name { font-family: 'Sora', sans-serif; font-size: 26px; font-weight: 800; color: var(--deep); line-height:1; margin-bottom: 2px; }
.ll-logo-tag  { font-size: 11px; font-weight: 600; color: var(--teal); letter-spacing: .07em; text-transform: uppercase; }

.ll-illus { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; }
.ll-blob-bg {
  position: absolute; width: 100%; height: 100%; max-width: 480px; max-height: 440px;
  background: radial-gradient(ellipse, #D4EFE4 0%, #EAF7F2 55%, transparent 80%);
  border-radius: 55% 45% 60% 40% / 50% 55% 45% 50%;
  top: 50%; left: 50%; transform: translate(-50%,-50%);
}
.ll-dot { position: absolute; border-radius: 50%; }
.ll-footer { font-size: 10px; color: var(--tlight); z-index: 2; position: relative; line-height: 1.7; }

/* RIGHT dark panel — form area */
.login-right {
  flex: 1; display: flex; flex-direction: column;
  justify-content: center; padding: 48px 60px 48px 72px;
  position: relative; z-index: 1;
}
.lr-title {
  font-family: 'Sora', sans-serif;
  font-size: 44px; font-weight: 800;
  color: var(--white); letter-spacing: -1px;
  margin-bottom: 8px;
}
.lr-sub { font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 28px; font-weight: 400; }

/* login input overrides moved to login_page local styles */

.form-link { font-size: 12px; color: rgba(255,255,255,0.38); text-align: right; margin-top: 4px; cursor: pointer; }
.form-link:hover { color: rgba(255,255,255,0.65); }
.register-link { font-size: 13px; color: rgba(255,255,255,0.5); text-align: center; margin-top: 18px; }
.register-link a { color: var(--mint2); text-decoration: none; font-weight: 600; }
.demo-hint {
  background: rgba(94,203,173,0.1); border: 1px solid rgba(94,203,173,0.25);
  border-radius: 10px; padding: 9px 14px;
  font-size: 12px; color: var(--mint2); margin-bottom: 20px; line-height: 1.5;
}
.demo-hint code { background: rgba(255,255,255,0.1); border-radius: 4px; padding: 1px 6px; font-family: 'DM Mono', monospace; }

/* ═══════════════════════════════════
   SIDEBAR STYLES
═══════════════════════════════════ */
.saathi-sidebar {
  display: flex; flex-direction: column; width: 100%; min-height: 100vh;
}
.sb-logo {
  padding: 24px 20px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  display: flex; align-items: center; gap: 10px;
}
.sb-logo img { width: 40px; height: 40px; border-radius: 10px; }
.sb-logo-name { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 800; color: #fff; }
.sb-logo-tag  { font-size: 10px; color: rgba(255,255,255,0.35); letter-spacing:.07em; }
.sb-shop {
  margin: 14px 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 10px 14px;
}
.sb-shop-lbl { font-size: 10px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing:.07em; }
.sb-shop-name { font-size: 13px; font-weight: 600; color: #fff; margin-top: 2px; display: flex; align-items: center; gap: 6px; }
.sb-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 6px var(--green); display: inline-block; }
.sb-nav-section { font-size: 10px; color: rgba(255,255,255,0.28); text-transform: uppercase; letter-spacing:.1em; padding: 14px 20px 5px; font-family: 'DM Mono', monospace; }
.sb-nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 20px; font-size: 13.5px;
  color: rgba(255,255,255,0.55);
  border-left: 3px solid transparent;
  cursor: pointer; transition: all .15s;
}
.sb-nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
.sb-nav-item.active {
  background: rgba(79,189,186,0.14);
  color: var(--mint); border-left-color: var(--mint); font-weight: 600;
}
.sb-badge {
  margin-left: auto; font-size: 10px; font-weight: 700;
  background: var(--red); color: #fff;
  padding: 1px 7px; border-radius: 99px;
}
.sb-footer {
  margin-top: auto; padding: 14px 16px;
  border-top: 1px solid rgba(255,255,255,0.07);
}
.sb-ai-pill {
  background: rgba(46,204,113,0.1); border: 1px solid rgba(46,204,113,0.22);
  border-radius: 10px; padding: 10px 12px;
  font-size: 11px; color: var(--green); line-height: 1.55;
}
.sb-logout {
  margin-top: 10px; background: rgba(230,57,70,0.08);
  border: 1px solid rgba(230,57,70,0.2);
  border-radius: 10px; padding: 9px 14px;
  font-size: 13px; color: rgba(230,57,70,0.8);
  text-align: center; cursor: pointer;
  font-weight: 600; transition: all .15s;
}
.sb-logout:hover { background: rgba(230,57,70,0.15); color: var(--red); }

/* ═══════════════════════════════════
   TOPBAR
═══════════════════════════════════ */
.tb-title { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 800; color: var(--deep); }
.tb-sub   { font-size: 12px; color: var(--tmid); margin-top: 1px; }
.tb-chip  { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 6px 14px; font-size: 12px; color: var(--tmid); font-family: 'DM Mono', monospace; display:inline-block;}
.tb-avatar { width: 36px; height: 36px; border-radius: 9px; background: linear-gradient(135deg, var(--teal), var(--mint)); display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #fff; font-family: 'Sora', sans-serif; }
.tb-title { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 800; color: var(--deep); }
.tb-sub   { font-size: 12px; color: var(--tmid); margin-top: 1px; }
.tb-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.tb-chip  { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 6px 14px; font-size: 12px; color: var(--tmid); font-family: 'DM Mono', monospace; }
.tb-avatar { width: 36px; height: 36px; border-radius: 9px; background: linear-gradient(135deg, var(--teal), var(--mint)); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #fff; font-family: 'Sora', sans-serif; }

/* ═══════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════ */
[data-testid="stApp"] { background: var(--bg) !important; }
[data-testid="block-container"] { padding: 3rem 2rem !important; }
[data-testid="stSidebar"] { background: var(--deep) !important; border-right: 1px solid rgba(255,255,255,0.06) !important; }
[data-testid="stSidebarUserContent"] { padding: 0 !important; padding-top: 10px !important; }

/* metric cards */
.kpi-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 16px; padding: 18px 20px;
  box-shadow: 0 2px 12px rgba(15,61,62,0.07);
  transition: transform .2s, box-shadow .2s;
}
.kpi-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(15,61,62,0.11); }
.kpi-icon { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 17px; margin-bottom: 10px; }
.kpi-val  { font-family: 'Sora', sans-serif; font-size: 26px; font-weight: 800; color: var(--deep); line-height: 1; }
.kpi-lbl  { font-size: 11px; color: var(--tmid); font-weight: 600; text-transform: uppercase; letter-spacing: .05em; margin-top: 5px; }
.kpi-delta { font-size: 11px; margin-top: 5px; font-family: 'DM Mono', monospace; font-weight: 600; }
.d-up   { color: var(--green); }
.d-down { color: var(--red); }
.d-warn { color: var(--amber); }

/* section cards */
.sec-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 20px 22px; margin-bottom: 18px; box-shadow: 0 2px 12px rgba(15,61,62,0.05); }
.sec-title { font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700; color: var(--deep); margin-bottom: 3px; }
.sec-sub   { font-size: 12px; color: var(--tmid); margin-bottom: 14px; }

/* tables */
.s-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.s-table th { background: #EAF5EE; color: var(--teal); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; padding: 9px 14px; text-align: left; border-bottom: 1px solid var(--border); }
.s-table td { padding: 11px 14px; border-bottom: 1px solid rgba(31,122,122,0.06); color: var(--deep); vertical-align: middle; }
.s-table tr:hover td { background: rgba(79,189,186,0.04); }
.s-table .pname { font-weight: 600; font-size: 13px; }

/* tags */
.tag { display: inline-block; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 99px; }
.tag-red   { background: rgba(230,57,70,0.1);  color: var(--red); }
.tag-green { background: rgba(46,204,113,0.1); color: #1aab5a; }
.tag-amber { background: rgba(255,183,3,0.12); color: #a07800; }
.tag-teal  { background: rgba(79,189,186,0.12);color: var(--teal); }

/* progress */
.prog-wrap { background: var(--bg); border-radius: 99px; height: 6px; overflow: hidden; }
.prog-fill { height: 100%; border-radius: 99px; }

/* dashboard button overrides */
.dash-body .stButton > button {
  color: #fff !important; background: var(--teal) !important;
  border: none !important; width: auto !important;
  padding: 8px 20px !important; font-size: 12px !important;
  margin-top: 0 !important; box-shadow: none !important;
}
.dash-body .stButton > button:hover { background: var(--deep) !important; transform: none !important; }

/* plotly charts */
.stPlotlyChart { border-radius: 12px; overflow: hidden; }
</style>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# SIDEBAR  (only shown when logged in)
# ══════════════════════════════════════════════════════════════════════════════
def render_sidebar():
    logo_img = f'<img src="{LOGO_SRC}">' if LOGO_SRC else "💚"
    nav_items = [
        ("📊", "Dashboard",      "dashboard",  None),
        ("📈", "Demand Forecast","forecast",   None),
        ("💀", "Dead Stock",     "dead_stock", "8"),
        ("🔔", "Alerts",         "alerts",     "3"),
        ("📦", "Inventory",      "inventory",  None),
        ("🏪", "Peer Insights",  "peers",      None),
        ("⚙️",  "Settings",      "settings",   None),
    ]
    html = f"""
    <div class="saathi-sidebar">
      <div class="sb-logo">
        {logo_img}
        <div><div class="sb-logo-name">Saathi</div><div class="sb-logo-tag">INVENTORY AI</div></div>
      </div>
      <div class="sb-shop">
        <div class="sb-shop-lbl">Active Shop</div>
        <div class="sb-shop-name"><span class="sb-dot"></span>{st.session_state.shop_name or "Raju Kirana — Kukatpally"}</div>
      </div>
      <div class="sb-nav-section">Main</div>"""
    for icon, label, key, badge in nav_items:
        active = "active" if st.session_state.active_page == key else ""
        badge_html = f'<span class="sb-badge">{badge}</span>' if badge else ""
        html += f'<div class="sb-nav-item {active}" onclick="window.location.href=\'?nav={key}\'">{icon} &nbsp;{label}{badge_html}</div>'
    html += """
      <div class="sb-footer">
        <div class="sb-ai-pill">🤖 &nbsp;<b>AI Engine active</b><br><span style="opacity:.75">Forecast updated 2 hrs ago</span></div>
      </div>
    </div>"""
    st.sidebar.markdown(html, unsafe_allow_html=True)

    # handle nav via query params
    qp = st.query_params
    if "nav" in qp and qp["nav"] != st.session_state.active_page:
        st.session_state.active_page = qp["nav"]
        st.rerun()


def render_topbar(title, subtitle):
    from datetime import datetime
    today = datetime.now().strftime("%d %b %Y")
    initials = "".join(w[0].upper() for w in (st.session_state.user_name or "RK").split()[:2]) or "RK"
    
    st.markdown("""
        <style>
        .logout-btn button {
            background-color: #E63946 !important;
            border: none !important;
            color: #FFFFFF !important;
            padding: 5px 12px !important;
            border-radius: 6px !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
        }
        .logout-btn button:hover {
            background-color: #D32F2F !important;
            color: #FFFFFF !important;
        }
        </style>
    """, unsafe_allow_html=True)
    
    col1, col2, col3, col4 = st.columns([0.5, 0.25, 0.1, 0.15])
    with col1:
        st.markdown(f'<div class="tb-title">{title}</div><div class="tb-sub">{subtitle}</div>', unsafe_allow_html=True)
    with col2:
        st.markdown(f'<div class="tb-chip" style="float:right; margin-top:2px;">📅 {today}</div>', unsafe_allow_html=True)
    with col3:
        st.markdown(f'<div class="tb-avatar" style="float:right; margin-top:2px;">{initials}</div>', unsafe_allow_html=True)
    with col4:
        st.markdown('<div class="logout-btn">', unsafe_allow_html=True)
        if st.button("🔒 LOGOUT", key=f"btn_logout_{title.replace(' ', '')}", use_container_width=True):
            st.session_state.clear()
            st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)
        
    st.markdown("<hr style='margin:16px 0 24px 0; border:none; border-top:1px solid rgba(15,61,62,0.1);'>", unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# LOGIN PAGE
# ══════════════════════════════════════════════════════════════════════════════
def login_page():
    st.markdown("""
    <style>
    [data-testid="stApp"] { background: #0F3D3E !important; }
    .login-blob1,.login-blob2,.login-blob3 { display:block; }
    
    /* dark theme input overrides exclusively for login page */
    [data-testid="stTextInput"] label { color: rgba(255,255,255,0.75) !important; }
    [data-testid="stTextInput"] > div > div > input {
      color: var(--white) !important; background: rgba(255,255,255,0.08) !important;
      border: 1px solid rgba(255,255,255,0.15) !important;
    }
    [data-testid="stTextInput"] > div > div > input:focus {
      border-color: rgba(255,255,255,0.5) !important; background: rgba(255,255,255,0.12) !important;
      box-shadow: 0 0 0 3px rgba(255,255,255,0.07) !important;
    }
    [data-testid="stTextInput"] > div > div > input::placeholder { color: rgba(255,255,255,0.28) !important; font-style: italic; }
    div.stButton > button {
      color: var(--deep) !important; background: var(--mint2) !important;
      border: none !important; box-shadow: 0 6px 22px rgba(94,203,173,0.38) !important; margin-top: 10px !important;
    }
    div.stButton > button:hover {
      background: #45b896 !important; transform: translateY(-2px) !important;
      box-shadow: 0 10px 30px rgba(94,203,173,0.48) !important;
    }
    </style>
    <div class="login-blob1"></div>
    <div class="login-blob2"></div>
    <div class="login-blob3"></div>
    """, unsafe_allow_html=True)

    logo_img = f'<img src="{LOGO_SRC}" alt="Saathi">' if LOGO_SRC else '<span style="font-size:44px">💚</span>'

    # Render the static left panel
    st.markdown(f"""
    <div class="login-split">
      <div class="login-left">
        <div class="ll-logo">
          {logo_img}
          <div>
            <div class="ll-logo-name">Saathi</div>
            <div class="ll-logo-tag">Your Business Companion</div>
          </div>
        </div>
        <div class="ll-illus">
          <div class="ll-blob-bg"></div>
          <div class="ll-dot" style="width:44px;height:44px;background:rgba(31,122,122,0.13);top:18%;right:10%;"></div>
          <div class="ll-dot" style="width:20px;height:20px;background:rgba(31,122,122,0.08);top:34%;right:5%;"></div>
          <div class="ll-dot" style="width:30px;height:30px;background:rgba(31,122,122,0.12);bottom:22%;left:7%;"></div>
          <div class="ll-dot" style="width:16px;height:16px;background:rgba(31,122,122,0.07);bottom:12%;left:16%;"></div>
          <div class="ll-dot" style="width:18px;height:18px;background:rgba(79,189,186,0.12);top:10%;left:32%;"></div>
          <svg viewBox="0 0 300 280" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:90%;max-width:440px;height:auto;position:relative;z-index:2;">
            <ellipse cx="150" cy="253" rx="92" ry="7" fill="#2A8C6E" opacity="0.1"/>
            <rect x="54" y="112" width="192" height="136" rx="8" fill="#EAF7F2" stroke="#2A8C6E" stroke-width="1.4"/>
            <path d="M40 120 L150 54 L260 120 Z" fill="#1B4D3E"/>
            <rect x="183" y="64" width="13" height="28" rx="3" fill="#0F3028" opacity="0.65"/>
            <circle cx="189" cy="56" r="5" fill="#C8E8D8" opacity="0.7"/>
            <circle cx="194" cy="47" r="4" fill="#C8E8D8" opacity="0.5"/>
            <circle cx="188" cy="41" r="3" fill="#C8E8D8" opacity="0.35"/>
            <rect x="90" y="118" width="120" height="21" rx="5" fill="#2A8C6E"/>
            <text x="150" y="132" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="800" fill="white">SAATHI STORE</text>
            <rect x="124" y="180" width="28" height="46" rx="4" fill="#2A8C6E"/>
            <rect x="127" y="183" width="10" height="18" rx="2" fill="#1B4D3E" opacity="0.35"/>
            <rect x="140" y="183" width="10" height="18" rx="2" fill="#1B4D3E" opacity="0.35"/>
            <circle cx="148" cy="205" r="2.5" fill="#5ECBAD"/>
            <rect x="63" y="132" width="40" height="32" rx="5" fill="white" stroke="#5ECBAD" stroke-width="1.2"/>
            <line x1="83" y1="132" x2="83" y2="164" stroke="#5ECBAD" stroke-width="0.8"/>
            <line x1="63" y1="148" x2="103" y2="148" stroke="#5ECBAD" stroke-width="0.8"/>
            <rect x="197" y="132" width="40" height="32" rx="5" fill="white" stroke="#5ECBAD" stroke-width="1.2"/>
            <line x1="217" y1="132" x2="217" y2="164" stroke="#5ECBAD" stroke-width="0.8"/>
            <line x1="197" y1="148" x2="237" y2="148" stroke="#5ECBAD" stroke-width="0.8"/>
            <rect x="218" y="208" width="24" height="18" rx="3" fill="#5ECBAD" opacity="0.8"/>
            <rect x="222" y="198" width="18" height="13" rx="2" fill="#2A8C6E" opacity="0.85"/>
            <line x1="224" y1="202" x2="237" y2="202" stroke="white" stroke-width="0.9" opacity="0.55"/>
            <circle cx="74" cy="207" r="9" fill="#1B4D3E" opacity="0.7"/>
            <path d="M74 216 Q67 230 65 240" stroke="#1B4D3E" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
            <path d="M74 216 Q81 230 83 240" stroke="#1B4D3E" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
            <path d="M70 224 L78 224" stroke="#1B4D3E" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
            <polyline points="34,74 48,63 60,68 74,55 88,59" stroke="#5ECBAD" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.8"/>
            <circle cx="88" cy="59" r="3.5" fill="#5ECBAD" opacity="0.9"/>
            <circle cx="210" cy="73" r="3" fill="#5ECBAD" opacity="0.65"/>
            <circle cx="228" cy="85" r="2" fill="#5ECBAD" opacity="0.4"/>
            <circle cx="60" cy="89" r="2.5" fill="#2A8C6E" opacity="0.5"/>
          </svg>
        </div>
        <div class="ll-footer">© 2025 Saathi · AI Inventory Intelligence<br>Powered by ML · Built for Indian SMEs</div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    # Form area — placed using layout columns
    c_empty, c_form, c_margin = st.columns([0.54, 0.38, 0.08])
    
    with c_form:
        st.markdown("<div style='height: 15vh;'></div>", unsafe_allow_html=True)
        st.markdown("""
        <div class="login-right" style="padding:0;background:transparent;">
          <div class="lr-title">Welcome Back 👋</div>
          <div class="lr-sub">Sign in to manage your shop's inventory</div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("""
        <div class="demo-hint">
          🔑 &nbsp;<b>Quick demo:</b> &nbsp;Username: <code>demo</code> &nbsp;·&nbsp; Password: <code>demo</code>
        </div>""", unsafe_allow_html=True)

        tab1, tab2 = st.tabs(["🔐  Sign In", "📝  Sign Up"])

        with tab1:
            username = st.text_input("Username", key="li_user", placeholder="Enter your name or email")
            password = st.text_input("Password", key="li_pass", placeholder="Enter your password", type="password")
            st.markdown("<div class='form-link'>Forgot Password?</div>", unsafe_allow_html=True)

            if st.button("Sign In →", key="btn_login"):
                if username and password:
                    st.session_state.logged_in  = True
                    st.session_state.user_name  = username.strip().title()
                    st.session_state.shop_name  = "Raju Kirana — Kukatpally"
                    st.session_state.active_page = "dashboard"
                    st.rerun()
                else:
                    st.error("Please fill in both fields.")

            st.markdown("<div class='register-link'>New to Saathi? <a href='#'>Create Account</a></div>", unsafe_allow_html=True)

        with tab2:
            su_name  = st.text_input("Full Name",      key="su_n", placeholder="Ramesh Kumar")
            su_store = st.text_input("Store Name", key="su_s", placeholder="Ramesh General Stores")
            su_loc   = st.text_input("Store Location", key="su_l", placeholder="Hyderabad")
            su_phone = st.text_input("Phone",      key="su_p", placeholder="+91 98765 43210")
            su_email = st.text_input("Email",          key="su_e", placeholder="you@email.com")
            su_pass  = st.text_input("Set Password",   key="su_pw", placeholder="Strong password", type="password")
            su_gstin = st.text_input("GSTIN",      key="su_g", placeholder="27AAAAA0000A1Z5")

            if st.button("Create Account →", key="btn_reg"):
                if su_name and su_store and su_phone and su_pass:
                    st.success("✅ Account created! Please sign in.")
                else:
                    st.error("Name, Store, Phone & Password are required.")

    st.markdown("""
    <style>
    .rfoot { position:fixed;bottom:18px;right:28px;font-size:11px;color:rgba(255,255,255,0.28);text-align:right;z-index:200; }
    .rfoot a { color:rgba(255,255,255,0.38); text-decoration:none; }
    </style>
    <div class="rfoot">Need help? <a href="mailto:support@saathi.app">support@saathi.app</a></div>
    """, unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# DASHBOARD SHELL  (routes to sub-pages)
# ══════════════════════════════════════════════════════════════════════════════
def show_dashboard():
    render_sidebar()

    page = st.session_state.active_page

    # Logout button inside sidebar area using Streamlit
    st.markdown("""
    <style>
    .logout-area { position:fixed;left:0;bottom:68px;width:230px;z-index:1000;padding:0 16px; }
    .logout-area .stButton > button {
      background: rgba(230,57,70,0.08) !important;
      border: 1px solid rgba(230,57,70,0.22) !important;
      color: rgba(230,57,70,0.85) !important;
      border-radius: 10px !important;
      font-size: 13px !important; font-weight: 600 !important;
      padding: 9px 14px !important; width: 100% !important;
      box-shadow: none !important; margin-top: 0 !important;
    }
    .logout-area .stButton > button:hover { background: rgba(230,57,70,0.15) !important; color: #E63946 !important; transform: none !important; }
    </style>
    <div class="logout-area">
    """, unsafe_allow_html=True)
    if st.button("🚪 Logout", key="logout_btn"):
        st.session_state.logged_in   = False
        st.session_state.active_page = "dashboard"
        st.rerun()
    st.markdown("</div>", unsafe_allow_html=True)

    # Route to page
    if page == "dashboard":
        from pages.dashboard import render
        render(render_topbar)
    elif page == "dead_stock":
        from pages.dead_stock import render
        render(render_topbar)
    elif page == "alerts":
        from pages.alerts import render
        render(render_topbar)
    elif page == "forecast":
        from pages.forecast import render
        render(render_topbar)
    elif page == "inventory":
        from pages.inventory import render
        render(render_topbar)
    elif page == "peers":
        from pages.peers import render
        render(render_topbar)
    elif page == "settings":
        from pages.settings import render
        render(render_topbar)
    else:
        from pages.dashboard import render
        render(render_topbar)


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════
if st.session_state.logged_in:
    show_dashboard()
else:
    login_page()