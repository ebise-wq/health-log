# Daily log

A daily symptom log for one person, one phone. No build step, no server, no
accounts, no network calls. Everything lives in the browser on the device.

Open it and the Home screen says what is still to log. A day where nothing is
off baseline takes one tap: **Nothing off baseline — save it**.

## Files

| File | What it is |
|---|---|
| `index.html` | The page. Shell only. |
| `app.js` | All the logic and all the screens. |
| `styles.css` | Colours and sizes from the build brief. |
| `manifest.json` | Makes it installable on the home screen. |
| `sw.js` | Service worker. Caches the app so it opens offline. |
| `icons/` | Home screen icons. |

## The screens

**Home** is a dashboard. It shows only what still needs logging: a card for the
evening, a card for the night that just ended. Before mid-afternoon the night
comes first; after that the evening does. Anything already logged collapses
into one dim line further down, still tappable to edit.

Under that are two numbers — the **week score** (how it has been) and the
**PEM predictor** (what the next day or two are exposed to) — and a seven day
grid of sleep, PEM, symptoms above baseline and demand above it. At the bottom is how
long ago you last downloaded a backup.

**RLHF** is the reward tab, and a permanent one. It holds the pot, the log of
what earned it, a way to add a win you did not log at the time, and a record of
what has been spent out of it.

The **Evening** card only appears from 21:00. Before then Home offers a quiet
line instead, so the screen is still one tap away — a card that only existed
after nine would leave no route in at four in the afternoon. The one-tap
"nothing off baseline" save lives on that card, so it waits for the evening
too. The hour is `EVENING_FROM_HOUR` at the top of the home section.

**Evening** and **Morning** are not permanent tabs. You reach them from Home,
and the tab appears only while you are on one, so there is a way back.

**History** is the full list of days, plus the backup buttons. Each day has a
**Night** button beside it that opens the Morning screen for the night after
that day. Before v1.30.1 the Morning screen was only reachable from Home, for
last night.

**Settings** is a short menu — Baselines, What to track, Sleep, Rewards — each
on its own page. Baselines used to sit at the top of this screen as twenty-odd
rating rows, which made everything else read like a footnote you had to scroll
past. Each row shows its current state, so the menu answers most questions
without opening anything.

## Putting it on the phone

1. In GitHub, go to **Settings → Pages**.
2. Under *Build and deployment*, set **Source** to *Deploy from a branch*,
   pick the branch this code is on, folder `/ (root)`, and press Save.
3. Wait a minute, then open the URL Pages gives you in Chrome on the phone.
4. Browser menu → **Add to Home screen** (works in Firefox and Chrome).
5. Open it from the home screen icon once while online, so the service worker
   can cache everything. After that it opens with no signal.

## Where the data is

In `localStorage`, under the key `sr-daily-log-v1`, as one JSON object:

```
{ version: 2, baselines: { tired: 2, ... }, days: { "2026-09-14": { ... } } }
```

One record per day. A night belongs to the evening date: the Tuesday evening
entry and the Wednesday morning entry are the same record, labelled Tuesday.

Every tap saves straight away. **Save day** only marks the day complete — days
touched but not saved show as drafts in History.

## Backups

Browser storage gets wiped eventually, by a Chrome cleanup, a reinstall, or a
tap in the wrong settings screen. So:

- **Download JSON** in History writes the whole dataset, baselines included,
  to a file. Do this now and then and keep the file somewhere else.
- **Restore from a JSON file** reads one back. It merges: a day already on the
  phone is only replaced if the file's copy is newer. Restoring an old backup
  never destroys newer entries, so it is safe to press.
- **Download CSV** writes the long format that matches the Visible exports, so
  old and new data can be stacked in one file:
  `observation_date,tracker_name,tracker_category,observation_value,baseline`
- **Copy JSON to clipboard** is there for when a download is awkward.

## Changing the app

Edit the files and push. Two things must be bumped together on every change:

1. `VERSION` at the top of `app.js` — this is the number in the bottom corner.
2. `CACHE` at the top of `sw.js` — same string.

If `CACHE` is not bumped, the phone keeps serving the old build from its cache
and the version number in the corner will tell you so.

### How a new build reaches the phone

GitHub Pages takes about a minute to publish after a push. After that:

- Open the app with a connection. It loads instantly from cache, checks for a
  new build in the background, and if you have not touched anything yet it
  swaps itself in and reloads on its own. That takes a few seconds. The version
  number in the corner is how you confirm it happened.
- If you are already entering a day, nothing moves. A line appears in the
  corner — **new build ready · load it** — and it waits for you.
- Opened with no signal, it stays on the build it has. It updates the next time
  you open it online.

So: yes, it updates itself, but only when opened online, and never mid-entry.

## Today does not count until the evening is submitted

A day in progress is not a reading. Until Save day is pressed, today is left
out of both scores, both panels, the chart, the pacing row and the strips — its
column is simply empty.

Without that, a few items tapped in the afternoon would feed the numbers, and
today carries the heaviest weight of any day in the PEM predictor's window. A
heavy but unfinished day could push the predictor hard on the strength of three
taps. Every backward-looking view reads days through one function,
`settledEntry`, so there is one place where this holds.

Two things are deliberately **not** gated. The pot pays a win the moment you
log it. History still lists today as a draft, since that is what History is
for.

### When the two scores change

Both scores are read at the last day whose evening was saved (`scoreEnd`), not
at today's date. They change at exactly two moments:

- **Saving an evening** moves both.
- **Logging a morning** moves both again. The night is stored on the evening
  before it, and sleep feeds the PEM predictor as a risk factor and the week
  score as a symptom.

Nothing else moves them. Reading them at today's date made them drift on their
own: at midnight the window slid a day and the weights shifted under the same
data, so the numbers changed overnight with nothing logged — in one test run
from 74 and 34 to 72 and 53 — and the change that saving an evening made was
hard to see against that. The pacing row already worked this way.

If an evening is missed, the anchor stays on the last one saved, and the word
beside each score becomes "as of" that day, so an old number is not passed off
as a current one. The chart in each panel draws no point after the anchor.

The morning can move PEM down as well as up. The predictor is an average over
the items it has for a day, so a night better than the rest of that day pulls
the average down, and a worse one pushes it up. Measured on a day one step over
baseline on every demand item: a normal night took it from 16 to 12, an awful
one (quality 0, 3 hours) from 16 to 18. A poor-but-not-awful night landed about
level with the day, 16 to 15.

## What Home shows

Settings → **Home screen** turns each block on or off: the scores, the chart,
the pacing row, Logged today, the pot, the backup reminder. The date and the
things still to log always stay, since without them there is no app.

The two scores sit side by side and small. Stacked full width tiles took four
hundred pixels to say two numbers, and one above the other made them read as a
list rather than as a pair to compare — which matters here, because they point
in opposite directions. The method line that used to sit under each one lives
in the panel behind the chevron.

## The score panels

Tapping either number on Home opens its own panel: the score over the last
fourteen days, and what is behind the current figure.

The breakdown is **exact, not an illustration**. Both scores are a weighted
mean of daily burdens, and each daily burden is a plain mean over the items
counted that day, which decomposes: an item's share is the same weighted mean
of its own burden divided by the number of items counted alongside it. Those
shares sum to the burden the score is built from — verified to nine decimal
places by a test, not by eye. The only gap you will see on screen is the
rounding of the score itself to a whole number.

Each row carries the last seven days of what you actually entered, newest on
the right, coloured the same way the rest of the app colours that item. Sleep
hours has its own row showing the hours themselves, coloured by how far short
of target each night fell. Items sitting at or better than baseline are named
in one line at the bottom rather than given rows of their own.

Both scores and both panels read their item lists from one function each —
`loadParts` and `scoreParts` — so the number on Home and the breakdown that
explains it cannot disagree about what counted.

The panel's day weights are derived from the same half life the score uses
rather than copied, so the two cannot drift apart.

### The chart axis fits the fortnight

The week score is a mean across about twenty symptom items, and on any given
day most of them sit at baseline. So it lives in a narrow band — roughly 70 to
90 for a typical run of days — and against a fixed 0-100 axis every fortnight
drew as the same flat line whatever the fortnight did.

The axis now fits the data in the window. Three guards stop that from
misleading:

- It never narrows below **15 points**. The score moves about two and a half
  points per symptom item that shifts one step, so fifteen points is roughly
  six items changing — more than a week of noise, and small enough that an
  ordinary fortnight still fills a useful part of the height.
- It pads and rounds outward to fives, so the highest and lowest points are not
  glued to the rules, and it slides back inside 0-100 rather than squeezing, so
  a score near either end keeps the same amount of axis as one in the middle.
- **Both ends are labelled on the chart** and the caption says what the window
  is. An axis that does not start at zero and does not say so is the oldest
  chart lie there is. Position carries the value here rather than length, so a
  truncated axis is fair as long as it is legible.

The Home rows are zoomed the same way, each row to its own fortnight. They
have no end labels, because a 30-pixel row cannot carry two readable numbers,
so the caption says "zoomed" and the figure on the right gives the real value.
A consequence worth knowing: the bottom of a row is that row's lowest point in
the window, not zero. For comparing rows against each other on one shared
axis, Settings → Home screen → Lines draws them on a single 0-100 chart.

### Reading a day on the chart

Day-of-month numbers run along the bottom of both panel charts, with the month
under the first day and wherever it turns. Any day can be read exactly: hover
on a computer, tap on the phone (tap the same day again to close), or give the
chart focus and use the arrow keys. A crosshair snaps to the nearest day, so
you aim at a date rather than at a dot, and the readout lists every line at
that day, value first. It sits beside the crosshair on whichever side has
room.

### Did the warning come true?

The PEM predictor's chart has a second band underneath: the PEM you logged,
drawn under the day whose risk it would answer. With the default delay of one
day, Tuesday's risk sits over Wednesday's PEM, so a warning that came true shows
as the two lines rising together, and the readout names both days. The delay
is in Settings → PEM predictor, from 0 to 5 days; PEM usually lands 12 to 48
hours after the exertion behind it.

It is a band of its own rather than a second line on the same axis, because
the predictor runs 0-100 and PEM runs 0-3, and two scales on one axis invent a
relationship that is not there. The two bands share the dates and the
crosshair. The last days of the band stay empty until their PEM is logged. If
the PEM item is hidden, the band goes.

The delay only moves the drawing. It does not change how the predictor is
worked out.

### Why the week score sits high

Not a bug, and worth knowing before reading the number as a percentage. Three
things push it up:

- **It is a mean over every tracked symptom item.** Items at baseline
  contribute zero. On a real day five to eight of about twenty move, so a
  genuinely rough day still lands near 70 rather than near 0. Measured on the
  built-in set: three items one step worse scores 88, five scores 80, eight
  scores 71. Every item one step worse scores 42; every item at its worst
  scores 2. The bottom of the scale is real but nothing short of catastrophe
  reaches it.
- **Better than baseline earns nothing.** `itemBurden` floors at zero, so a
  good day and a normal day are the same number. The distribution is pressed
  against the ceiling by design.
- **Then seven days are averaged**, which smooths what is left.

The consequence to hold on to: **the number is comparable with your own recent
numbers, not with a percentage.** An 80 is not "80% well". The useful reading is
80 against last week's 84.

## What is tracked is a setting

Settings → **What to track**. Every item can be hidden,
and you can add your own.

- **Hiding** stops an item being asked for and stops it counting toward the
  scores. Everything already recorded is kept and still exports — the CSV walks
  every key ever defined, not just the ones on screen today.
- **Adding your own** takes a name, a scale (0-3 or no/yes), where it belongs
  (Symptoms, Exertion or Night) and its normal value, set right there in the
  form rather than in a separate trip to Baselines. It then behaves like any other item —
  it gets a baseline, joins the matching score, appears in the chart picker and
  exports under its own name. Removing one keeps its history in the export.
- **Which group** appears for a symptom only, because Exertion and Night each
  have a single section already. Pick Energy, Brain, Body or Gut and the item
  sits at the end of that section in the evening form, beside the built-in items
  it belongs with. Pick *Your own* — the default — and it lands in a section of
  that name at the end of the Symptoms band, which is where every custom symptom
  went before this existed, so anything added earlier stays put. A group whose
  built-in items are all hidden still appears if a custom item is filed under it,
  and an item whose group no longer exists falls back to *Your own*.

Both scores are an average across the items tracked, **so hiding or adding one
changes what the number is an average of.** Scores from before a change are not
strictly comparable with scores after it. That is the honest cost of making it
adjustable, and the screen says so.

The floors bend with it. The week score needs half the tracked symptom items
up to a maximum of eight, rather than a fixed eight, so hiding a handful cannot
silently switch a score off for good.

Everything downstream reads one registry, rebuilt by `rebuildItems()` whenever
the setup changes, so there is a single place that decides what exists.

## The pot

Two things pay, and both are things worth reinforcing rather than things that
happen to you. The amounts start at €0.20 a thing done well, €0.25 for a day
paced at 1 and €0.50 for a day paced at 0, and all three are editable in
Settings → Rewards — as is whether there is any money at
all.

The pot is **worked out from the log rather than banked**, so changing an
amount re-prices every day already recorded. With the money switched off, wins
are still logged and still counted, and the tab shows the count instead.

**The RLHF tab** opens on the balance and the record — earning days and
spending in one list, newest first — because that is what it is opened for.
Everything used now and then sits folded behind one tap: **Spend** and **Add a
missed win** are two buttons under the balance, each opening its form in place
and closing again once used, and **Totals and starting amount** at the foot opens
the breakdown and the starting amount. Nothing opens as a dialog.

**Spending** takes an amount, a description and a date, and comes off the
balance. Nothing stops the balance going negative — it is a record, not a lock.
A purchase can be removed from its row in the record. Purchases merge by id on
restore, so restoring an old backup cannot wipe spending recorded since.

**Money from before this tracker** is one figure, set under Totals and starting
amount. It is added to the balance and shown as its own line in the breakdown,
so the earned total still only counts what this app paid. Setting it again
replaces it, and 0 or an empty field clears it. It is stored inside the pay
settings, so it rides along in every backup. A backup made before this existed
has no such figure, and restoring one keeps the amount already set rather than
wiping it.

**A win you did not log at the time** can be added to any past day. It lands in
that day's record like any other win, so it exports with everything else.

**Did something well** is a plus and a line to write on, one row. Type what it
was and press the plus, or the return key, and it is logged. A plus pressed on
an empty line still logs one without any typing, so the cheap path survives for
a bad day. Nothing blocks, and the last one can be removed if it was a mis-tap.

The order is words first, plus second. It used to log on the tap and offer the
words afterwards, which meant the row changed shape as soon as it was used —
and a field that appears only after an action is a field that looks broken when
it does not.

A day only pays for pacing you actually stood behind — the same rule the scores
use. Every record starts pre-filled at baseline, and pacing's baseline is 1, so
without that rule a day you never really logged would quietly earn €0.25.

Amounts are written as `€0.20` rather than `€ 0,20`. Say the word if you would
rather have the Dutch format.

Wins export as `Done well` rows, one per win, carrying the text.

## Episodes

A timeline of autonomic episodes, one row per night, scored 0 to 5 with an S
flag for near-syncope. It draws on two sources:

- **Nights logged on the Morning screen.** The "Dysautonomic episode" and
  "Near-syncope" items already there feed it, so it fills in as you go.
- **A log kept elsewhere, imported from a file.** For history from before this
  app, or a log that someone goes over afterwards.

Where both have the same night, the imported one is shown: it is the one that
was reviewed. Importing again replaces the earlier import whole; nights logged
here are never touched by an import or by removing one.

### Your data stays on the phone

The file is picked on the phone and read there with `FileReader`. It is stored
in the phone's browser storage with everything else, and goes into the JSON
backup so it survives a wipe. **Nothing is uploaded**: the app makes no network
calls, and the service worker only serves the app's own files. The log is never
part of the code either, so nothing personal reaches the repository the app is
published from. Keep your log files out of this repository.

### What it reads

- **Markdown (.md)** — a table with a date column, a Score column and a "What
  happened" column, plus an optional Notes column. A score cell is a digit,
  optionally followed by S (`4 · S`); `—` is a night with no score; an empty
  score cell makes the row a marker instead (a change worth showing on the
  timeline). Two optional tables are picked up too: a scale (`Score |
  Definition`) and medication changes (`Date | Change`). A line beginning
  `Flag S` gives the S definition.
- **A timeline page (.html)** with its data in a `D` array of `{lab, v, flag,
  what, ctx}` and its scale in `SC`. Anything drawn into such a page only as
  positions on the drawing — medication markers, dose rings — cannot come
  across, because it is not data.
- **JSON (.json)** in the app's own shape: `{"kind": "episodes", "nights":
  [...], "changes": [...], "doses": [...], "scale": {...}}`, or a full backup
  from this app. This is the only format that carries dose nights.

Dates like `3–4 Mar` are a night and sit on the morning after it, `4 Mar
(eve)` is an evening event on that day, and a single date is that day. The year
is the first one the file mentions, and a log that runs from December into
January moves on a year by itself. English and Dutch month names both work.
Everything is cleaned on the way in: text is kept as text and never run or
inserted as markup.

### What it shows

Bars run 0 to 5 in the same colours as the Morning screen, with the number
written on nights of 3 and over only. Empty days are a tick on the axis; seven
or more empty days in a row fold into one line saying how many. Tapping a
night opens its description beside it, with Earlier and Later at full touch
size, because the rows are too dense to aim at one-handed. Tapping a number
along the top gives its definition, from the imported log's own scale where
it has one.

Three overlays, each a toggle: **medication changes** (a dot on the axis and a
dotted lead to a label), **dose nights** where the file has them (a ring by the
date), and a **7-day average** (off by default). Teal for the first two and
purple for the average, checked with the palette validator against each other
and against every bar colour; a blue average sat too close to the teal and was
dropped. Under the chart, the gaps in days between nights of 3 or more, and how
long since the last.

The average counts a blank night inside the imported log's date range as 0,
because such logs only write a night down when something happened, so
skipping blanks would average only the bad ones. Outside that range, nights are
logged here every morning and a blank is a night nobody logged, so it is left
out.

Medication changes can also be added on the tab, with a day and a few words.
They are kept with the backup and merge by id on restore.

The tab shows unless the episode item is hidden in Settings and nothing has
been imported.

## The week score

One number, 0-100, for the last seven days. **100 is a day at your normal.** It
is measured against your own baselines, so it says nothing about how you
compare with a healthy person — only how this week sat against your usual.

How it is built:

- Each item's distance the wrong side of its baseline becomes 0 to 1, where 1
  is as bad as that item goes. Being better than baseline counts as 0, never
  as credit.
- Sleep is inverted, because on that scale 3 is a good night.
- The day's burden is the mean across items, and the day score is
  `100 × (1 − burden)`.
- The week weights recent days more, with a three day half life: today counts
  1, three days back a half, six days back a quarter. Days with no entry are
  skipped and the weights renormalised.

What it deliberately leaves out:

- The five *what the day asked of you* items. Being physically active is a
  cause, not a symptom.
- Today, until you press Save day. See below.
- Values you have not stood behind. Every record starts pre-filled at baseline,
  so a night you never logged would otherwise count as a normal night and
  flatter the score. An item counts once you move it yourself, or once you
  press Save day (evening items) or finish the morning (night items).
- Days with fewer than 8 items entered, and weeks with fewer than 3 days.

Its main limitation: every item counts the same, so a crash weighs exactly as
much as mild constipation. If that turns out to matter, the fix is per-item
weights in `itemBurden`.

## PEM predictor

The forward-looking number. It runs the **opposite way to the week score**: a
high number is a warning, not a good sign. The band word next to it always says
which way it points — low, raised, high.

### Two axes, which are easy to confuse

- **Six items, within a day.** The five demand items — physically active,
  mentally demanding, socially demanding, emotionally stressful, pacing — plus
  sleep quality. Each becomes a 0 to 1 burden the same way the week score does,
  and the six are averaged into one burden for that day.
- **Four days, across the window.** Those day burdens are then weighted and
  combined.

So: six items make a day, four days make the score.

Pacing counts as demand because its scale is "low = better", so a high value is
a day you pushed through rather than paced. Sleep runs the other way and the
burden function already knows it.

**Sleep appears in both numbers on purpose.** In the week score it is a
symptom, part of how the week went. Here it is a risk factor: a bad night
leaves less to spend the next day. Same reading, two jobs.

### The day weights

PEM is delayed, typically by 12 to 48 hours, and it stacks: several ordinary
days in a row can do what no single day would. So today and yesterday carry
full weight — their PEM is still in flight — and the two days before taper off,
because their effect has largely already arrived:

```
today 1 · yesterday 1 · 2 days back 0.6 · 3 days back 0.3
```

The same heavy day therefore costs about three times as much when it is today
as when it is three days back.

Date keying does the right thing here without special handling. A night belongs
to the evening date, so tonight's sleep sits on today's record and has not
happened yet — and the "values you stand behind" rule leaves it out until you
log the morning.

### What it says

If the number is up and the last two days still score well, the cost has not
landed yet and the next day or two are the exposed part. If the number is up
and symptoms are already down, it has landed.

**The weights are a rule of thumb, not a measured curve.** There is no
validated formula for predicting PEM from self-reported exertion. The nearest
research idea is Leonard Jason's energy envelope work, which is correlational
and small. The name says predictor; read it as a prompt to think.

## Mood

Five points with neutral in the middle: happy, good, neutral, meh, bad. It is
the one genuinely two-sided scale in the app, so it gets a diverging ramp —
green out to happy, orange and red out to bad — with intensity growing away
from the middle in both directions rather than only upwards.

It was four points in v1.8.0 (happy, ok, meh, bad). Inserting neutral shifted
the meaning of 2 and 3, so the store carries a migration: anything written
before store version 3 has mood 2 bumped to 3 and 3 bumped to 4, in day
records and in the baseline. Restored backups go through the same step.
Without it, a day logged as bad would quietly redisplay as meh.

## Post-dinner indigestion

Until v1.6.0 this was "stomach at bedtime", a four way pick of none / normal /
heavy / odd. It is now a 0-3 rating like every other symptom, which means it
gets a baseline, counts toward the symptom score, and exports with a number.

The old values are **not converted** — "odd" is not a point on a severity scale
and guessing one would be inventing data. Records from before the change keep
their `stomach` value and still export it as `Stomach at bedtime`. New records
use `Post-dinner indigestion`. Its baseline starts at 0; set your own on the
Baseline screen.

## Episode questions on the Morning screen

When the Dysautonomic episode is 2 (mild) or higher, an "About the episode"
block opens under it. It asks:

- Near-syncope (no / yes)
- Times you pooped
- Midodrine taken (doses)
- Peak heart rate lying down (bpm)
- Peak heart rate seated (bpm)
- Minutes from the start of the episode to falling asleep

Below 2 the block is hidden. Values already entered are kept, so tapping the
episode down by mistake loses nothing. The threshold is `EP_ASK_FROM` in
`app.js`. The counts start blank, and blank means not recorded, not zero. They
are stored per night in `epDetail` and export as `Episode: …` rows. If the
episode item is hidden in Settings, Near-syncope goes back to being a plain
row.

## Food on the Evening screen

The Evening screen has a Food section: what you ate (free text), then "Was it a
leftover?" and "Was it spicy?" once something is written, and "Peanuts today".
The yes/no answers start blank, so an unanswered question is not read as "no".
They are stored in `food` and `peanuts` on the day, and export as `What you
ate`, `Meal was a leftover`, `Meal was spicy` and `Peanuts`, category `Food`.

## Hours slept

Recorded on the Morning screen with half hour steps, so it needs no keyboard in
the dark, and the field still takes a typed number.

It feeds the PEM predictor as **its own item, with the same weight as every
other one**. Quality and hours are two readings of the same night, so between
them sleep carries two of the seven slots on a night you log both — that is
deliberate. Leaving hours blank costs nothing: the day is then scored over the
six items it does have.

The reference is **hours you normally need**, set in Settings → Sleep and
starting at 8. Only sleeping short of it counts:

```
burden = (target − hours) / target, clamped to 0..1
```

Sleeping longer than target scores 0 rather than earning credit, the same as
every other item. Nothing penalises a long night, which in ME/CFS can mean
either recovery or a crash — the app does not pretend to know which.

It exports as `Sleep hours`. The 0-3 rating still exports as `Sleep`, the name
your Visible history uses, even though the screen labels it Sleep quality.

## Notifications

There are none, and there cannot be without changing what this app is.

A web app can only be pushed to by a **server** sending the push — the phone
subscribes, and something has to be at the other end. This app has no server
and makes no network calls, which is the point of it.

The one API that would have allowed a purely local scheduled notification,
Notification Triggers (`showTrigger` with a `TimestampTrigger`), ran as a
Chrome origin trial twice and was then **abandoned**. It never shipped, and
nothing replaced it. A notification can only be raised while the page is
actually open, which is no use as a reminder.

Web Push itself does work in Firefox on Android for an installed app, so if a
tiny server ever became acceptable it is buildable. Until then the phone's own
alarm or a repeating calendar entry does the job, needs no code, and fires
without a signal.

## What the numbers mean

Said once where a scale can be inferred, and per row only where it cannot.

**Under the band header**, read once for the sixteen symptom rows and once for
the exertion rows, laid out in the same columns as the buttons so each word
sits over the number it names:

```
Symptoms   0 none · 1 mild · 2 moderate · 3 severe
Exertion   0 none · 1 a little · 2 a fair bit · 3 a lot
```

The four button rows are the majority, so the columns line up with them. Mood
and the no/yes pairs carry their own words on the buttons anyway.

**Under the buttons**, for the three scales that cannot be read off their
neighbours:

```
sleep quality   awful · poor · ok · good        (3 is the good end)
pacing          paced well · slipped · pushed · pushed hard
episode         none · slight · mild · clear · strong · severe   (0-5)
```

Sleep quality and pacing are the two that genuinely invert. Pacing used to say
so in its label — "(low = better)" — which is a parenthetical doing work the
scale should do. The label is now just Pacing; it still exports as
`Pacing (low = better)`, the name the history uses.

Rows whose buttons already carry words — the no/yes pairs and Mood — get
nothing extra.

## Detail on an exertion row

Tapping a rating on an exertion row opens a one line box under it for what that
particular thing was: "Socially demanding 2 — video call with mum". Only the
row tapped last shows an empty box, so the screen stays quiet, but any row that
already has text keeps its box visible rather than hiding what was written.

Each line exports as its own row, `<item> note`, so the detail stays attached to
the category it describes rather than to the day in general. The single
band-wide note from v1.14.0 is gone, replaced by these; where one was written
it still exports.

**Other** lives in Exertion rather than Symptoms, which is where the detail box
makes it usable: a rating for how much it took, and a line saying what it was.

## Design rules, on purpose

- Dark, low-glare. No white anywhere, no bright surfaces.
- Touch targets at least 46px.
- No animation, no transitions, no confirmation dialogs.
- One scrolling column, 460px max, system font.
- The Evening screen is split by three large headers — Symptoms, Exertion,
  Bedtime and notes — so what happened to you and what you asked of yourself
  are never read as one list. The old group headers stay as small subtitles
  under them.
- Severity reads as heat: nothing, yellow, orange, red. Yellow through orange
  to red is the one multi-hue ramp that is not a rainbow — the hues carry the
  meaning. Every filled step takes dark ink at 4.9:1 or better.
- On a no/yes item, yes takes the severe end of the ramp. A crash drawn in the
  mildest colour would read as a small thing.
- A dot after a label means that value is off baseline. The dashed outline in
  a row marks the baseline, whether or not it is the value you picked.
- On the dashboard, colour is distance from your baseline, not the raw value:
  green better, grey at it, then the same yellow-orange-red heat for one, two,
  three or more steps worse. Every cell prints its number, so the colour never
  carries the value on its own.
- A score's colour follows its value across seven steps rather than three
  buckets. Both numbers are fed the same way — as "how good is this", which for
  the PEM predictor means 100 minus the score — so a green 91 and a green 28
  mean the same thing even though the numbers point opposite ways. Every step
  is contrast-checked against the page background; the weakest is 5.17:1.
- The chart's two lines were checked for colourblind separation rather than
  guessed: worst pair ΔE 17.6 under protanopia against a floor of 8. They sit
  slightly outside the standard categorical lightness and chroma bands on
  purpose — hitting those bands means a more saturated, brighter line, which
  this screen cannot have.
- Sleep gets a valenced ramp of its own on the entry screen, because 3 is a
  good night there while 3 means worst on every other row.

## Not in this version

Welltory HRV import, Garmin daily CSV import, charts. Entry has to be solid
first.
