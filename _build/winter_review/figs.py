"""Winter Break Review, section G: a TO-SCALE picture for every angle problem (Nov 23, 2026, Zach: "make sure that all
geometry problems have visuals"). Rule D3: the drawn angles match their numbers, and nothing in the picture gives the
answer away (no right-angle mark on an unknown, no measure written where the student must find it).
Writes grade8/practice/fig/WB_G*.png at 2x (the practice engine shows them at half size) and prints the sizes.
    python3 _build/winter_review/figs.py
"""
import math, os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Arc

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'grade8', 'practice', 'fig')
NAVY, BLUE, GOLD, GREEN, RED, GRAY = '#1E2D4F', '#0055A5', '#B8860B', '#1E9E00', '#C62828', '#6B7280'
SIZES = {}


def new(name, w, h):
    fig, ax = plt.subplots(); fig.set_size_inches(w / 100, h / 100); fig.subplots_adjust(0, 0, 1, 1)
    ax.set_aspect('equal'); ax.axis('off'); SIZES[name] = [w * 2, h * 2]; return fig, ax


def save(fig, name):
    fig.savefig(os.path.join(OUT, name), dpi=200); plt.close(fig)


def arc_label(ax, cx, cy, a0, a1, txt, col, r=0.55, rr=None, fs=16, place=None):
    """an arc from angle a0 to a1 (degrees, counter-clockwise) with its label just outside the arc"""
    ax.add_patch(Arc((cx, cy), 2 * r, 2 * r, theta1=a0, theta2=a1, color=col, lw=2))
    mid = math.radians((a0 + a1) / 2)
    if rr is None: rr = r + 0.45 if (a1 - a0) > 60 else r + 0.75
    # a long label (an expression) is anchored on the angle's bisector and runs AWAY from the vertex, so it never crosses a ray
    ha, va = 'center', 'center'
    if len(txt) > 4:
        ha = 'left' if math.cos(mid) > 0.25 else 'right' if math.cos(mid) < -0.25 else 'center'
        va = 'bottom' if math.sin(mid) > 0.6 else 'top' if math.sin(mid) < -0.6 else 'center'
        rr = r + 0.3
    x, y = cx + rr * math.cos(mid), cy + rr * math.sin(mid)
    if place: ha, va = place.get('ha', ha), place.get('va', va); x, y = cx + place.get('dx', x - cx), cy + place.get('dy', y - cy)
    ax.text(x, y, txt, ha=ha, va=va, color=col, fontsize=fs, fontweight='bold')


# ---- G1: vertical angles, 64° and x° (an X; the two lines cross at 64°) ----
def vertical(name, g, lab_known, lab_unknown):
    fig, ax = new(name, 334, 176); a1, a2 = math.radians(90 - g / 2), math.radians(90 + g / 2); L = 3
    for a, col in ((a1, BLUE), (a2, NAVY)):
        ax.plot([-L * math.cos(a), L * math.cos(a)], [-L * math.sin(a), L * math.sin(a)], color=col, lw=2.6)
    ax.plot([0], [0], 'o', color=NAVY, ms=4)
    arc_label(ax, 0, 0, 90 - g / 2, 90 + g / 2, lab_known, GOLD, rr=0.95)
    arc_label(ax, 0, 0, 270 - g / 2, 270 + g / 2, lab_unknown, RED, rr=0.95)
    ax.set_xlim(-2.9, 2.9); ax.set_ylim(-1.53, 1.53); save(fig, name)


# ---- G2: a linear pair, 112° and x° (a straight line with one ray) ----
def linear_pair(name, g, lab_known, lab_unknown):
    fig, ax = new(name, 334, 176); a = math.radians(g)
    ax.plot([-3, 3], [0, 0], color=NAVY, lw=2.6)                      # the straight line
    ax.plot([0, 2.2 * math.cos(a)], [0, 2.2 * math.sin(a)], color=BLUE, lw=2.6)   # the ray; g is measured from the RIGHT side
    ax.plot([0], [0], 'o', color=NAVY, ms=4)
    arc_label(ax, 0, 0, 0, g, lab_known, GOLD, r=0.6, rr=1.15)          # the known angle: from the right side up to the ray
    arc_label(ax, 0, 0, g, 180, lab_unknown, RED, r=0.6, rr=1.1)        # the unknown: from the ray to the left side
    ax.set_xlim(-2.9, 2.9); ax.set_ylim(-0.5, 2.5); save(fig, name)


# ---- parallel lines cut by a transversal; angle slots at each crossing: UR, UL, LL, LR ----
def parallel(name, theta, labels, mark_only=None):
    """theta = the acute angle between the transversal and the parallel lines (so the picture is to scale).
    labels = {('top'|'bot', 'UR'|'UL'|'LL'|'LR'): (text, color)}. At every crossing UR = LL = theta, UL = LR = 180 - theta."""
    fig, ax = new(name, 348, 232); t = math.radians(theta); dx, dy = math.cos(t), math.sin(t); H = 1.55
    for y in (H, -H): ax.plot([-4.3, 4.3], [y, y], color=NAVY, lw=2.4)
    P = {'top': (H / math.tan(t), H), 'bot': (-H / math.tan(t), -H)}
    L = 2.8 / dy
    ax.plot([-L * dx, L * dx], [-L * dy, L * dy], color=BLUE, lw=2.4)
    for (y, x) in ((H, P['top'][0]), (-H, P['bot'][0])): ax.plot([x], [y], 'o', color=NAVY, ms=4)
    # arrows that say "parallel"
    for y in (H, -H): ax.annotate('', xy=(3.6, y), xytext=(3.1, y), arrowprops=dict(arrowstyle='-|>', color=NAVY, lw=1.6))
    span = {'UR': (0, theta), 'UL': (theta, 180), 'LL': (180, 180 + theta), 'LR': (180 + theta, 360)}
    for (where, slot), (txt, col) in labels.items():
        cx, cy = P[where]; a0, a1 = span[slot]
        long = len(txt) > 4
        rr = (1.35 if long else 0.95) if (a1 - a0) > 60 else (1.55 if long else 1.15)
        arc_label(ax, cx, cy, a0, a1, txt, col, r=0.5, rr=rr, fs=14 if long else 16)
    ax.set_xlim(-4.6, 4.6); ax.set_ylim(-2.95, 2.95); save(fig, name)


# ---- G5: a triangle with angles A, B, C (degrees) drawn to scale; labels at each corner ----
def triangle(name, A, B, labs, cols, ext=None, place=None):
    """Corners: left (angle A), right (angle B), top (angle C = 180 - A - B). labs/cols are for (A, B, C).
    ext = (label, color) draws the exterior angle at the RIGHT corner by extending the base to the right."""
    C = 180 - A - B; assert C > 0
    fig, ax = new(name, 348, 210)
    base = 5.6
    # law of sines: side opposite A (right-top) etc.; place left at (0,0), right at (base,0)
    a, b, c = (math.radians(v) for v in (A, B, C))
    left_side = base * math.sin(b) / math.sin(c)        # from the left corner to the top
    top = (left_side * math.cos(a), left_side * math.sin(a))
    pts = [(0, 0), (base, 0), top]
    xs = [p[0] for p in pts] + [pts[0][0]]; ys = [p[1] for p in pts] + [pts[0][1]]
    ax.plot(xs, ys, color=NAVY, lw=2.4)
    # left corner: from the base (0°) up to the side (A°)
    def corner(cx, cy, a0, a1, txt, col, deg, key):
        if not txt: return                                   # an unlabeled corner gets no arc (nothing to hint at its size)
        long = len(txt) > 4
        rr = (1.2 if long else 1.0) if deg > 80 else (1.6 if long else 1.5) if deg > 50 else (1.75 if long else 1.7)   # labels sit clear of the sides
        arc_label(ax, cx, cy, a0, a1, txt, col, r=0.55, rr=rr, fs=14 if long else 16, place=(place or {}).get(key))
    corner(0, 0, 0, A, labs[0], cols[0], A, 'left')
    # right corner: from the side toward the top (180 - B) to the base (180)
    corner(base, 0, 180 - B, 180, labs[1], cols[1], B, 'right')
    # top corner: between the two sides
    ang_l = math.degrees(math.atan2(-top[1], -top[0])) % 360; ang_r = math.degrees(math.atan2(-top[1], base - top[0])) % 360
    lo, hi = sorted([ang_l, ang_r])
    if hi - lo > 180: lo, hi = hi, lo + 360
    corner(top[0], top[1], lo, hi, labs[2], cols[2], C, 'top')
    xmax = base + 0.6
    if ext:
        ax.plot([base, base + 2.2], [0, 0], color=NAVY, lw=2.4, linestyle=(0, (4, 3)))
        arc_label(ax, base, 0, 0, 180 - B, ext[0], ext[1], r=0.8, rr=1.5, fs=14)
        xmax = base + 3.1
    ax.set_xlim(-1.0, xmax + 0.3); ax.set_ylim(-0.7, max(top[1], 1.2) + 0.8); save(fig, name)


if __name__ == '__main__':
    vertical('WB_G1.png', 64, '64°', 'x°')
    linear_pair('WB_G2.png', 112, '112°', 'x°')
    # G3: alternate interior angles (3x + 15)° and 75°: x = 20, so the transversal makes 75° with the lines
    parallel('WB_G3.png', 75, {('top', 'LL'): ('75°', GOLD), ('bot', 'UR'): ('(3x + 15)°', RED)})
    # G4: same-side interior angles (2x + 10)° and (3x + 20)°: x = 30 → 70° and 110°, so theta = 70
    parallel('WB_G4.png', 70, {('bot', 'UR'): ('(2x + 10)°', RED), ('top', 'LR'): ('(3x + 20)°', GOLD)})
    # G5: x°, 2x°, 3x° → 30, 60, 90 (to scale; no right-angle mark, that would give x away)
    triangle('WB_G5.png', 30, 60, ('x°', '2x°', '3x°'), (RED, GOLD, BLUE))
    # G6: exterior angle (5x − 10)° at the right corner; far inside angles 40° (left) and (2x + 10)° (top): x = 20 → 40, 50, 90
    triangle('WB_G6.png', 40, 90, ('40°', '', '(2x + 10)°'), (GOLD, NAVY, BLUE), ext=('(5x − 10)°', RED), place={'top': dict(dx=-1.35, dy=-2.35, ha='center', va='top')})
    # G7: corresponding angles, both upper right (no numbers; the student names the pair)
    parallel('WB_G7.png', 60, {('top', 'UR'): ('1', GOLD), ('bot', 'UR'): ('2', GOLD)})
    import json; print(json.dumps(SIZES))
