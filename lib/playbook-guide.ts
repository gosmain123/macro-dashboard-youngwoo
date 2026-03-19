export type PlaybookMeaningMapItem = {
  id: string;
  label: string;
  meaning: string;
  whyItMatters: string;
};

export type LogicChain = {
  id: string;
  title: string;
  trigger: string;
  meaning: string;
  nextCheck: string;
  marketConfirmation: string;
  commonMistake: string;
  cautions: string[];
};

export type FollowUpLogic = {
  meaning: string;
  nextCheck: string;
  confirmation: string;
  invalidation: string;
  cautions: string[];
};

export type ViewBuilderScenario = {
  id: string;
  title: string;
  setup: string;
  interpretation: string;
  confirmWith: string;
  avoid: string;
};

export const playbookCautions = [
  "One print is not a trend",
  "Check revisions before forming a strong view",
  "Confirm with rates and credit before calling a regime turn"
] as const;

export const indicatorMeaningMap: PlaybookMeaningMapItem[] = [
  {
    id: "inflation-path",
    label: "CPI / Core PCE",
    meaning: "Use them as the inflation path, not just a headline reaction point.",
    whyItMatters: "They reset Fed easing odds, real yields, and valuation pressure."
  },
  {
    id: "labor-stress",
    label: "Payrolls / Claims",
    meaning: "Treat them as the labor demand and labor stress check.",
    whyItMatters: "They tell you whether growth is slowing softly or starting to break."
  },
  {
    id: "early-growth",
    label: "ISM Manufacturing / Services",
    meaning: "Read them as early direction for growth and demand breadth.",
    whyItMatters: "They usually move before the slower hard data fully turns."
  },
  {
    id: "policy-repricing",
    label: "2Y Treasury",
    meaning: "The 2Y is the cleanest policy repricing signal.",
    whyItMatters: "If it jumps, the market is often repricing the Fed faster than the headlines suggest."
  },
  {
    id: "discount-rate",
    label: "10Y Treasury",
    meaning: "The 10Y is the long-duration discount rate.",
    whyItMatters: "It tells you whether valuation pressure is easing or tightening."
  },
  {
    id: "credit-stress",
    label: "IG / HY Spreads",
    meaning: "Use credit spreads as the stress and risk-tolerance confirmation layer.",
    whyItMatters: "If credit disagrees with the macro story, slow down before making a strong call."
  },
  {
    id: "transmission",
    label: "Mortgage Rates",
    meaning: "Mortgage rates show how rates are transmitting into the real economy.",
    whyItMatters: "They connect bond market moves to housing demand and economic drag."
  }
] as const;

export const logicChains: LogicChain[] = [
  {
    id: "cpi-core-pce",
    title: "CPI / Core PCE Chain",
    trigger: "Inflation print comes in hotter or cooler than expected.",
    meaning: "That shifts the inflation path first, then Fed easing odds, then valuation pressure.",
    nextCheck: "Split headline vs core, then check shelter, services ex housing, and the 3m annualized pace.",
    marketConfirmation: "Confirm with the 2Y, real yields, and breakevens. If front-end and real yields both move, policy repricing is likely real.",
    commonMistake: "Overreacting to energy-driven headline noise when the sticky core details are calmer.",
    cautions: ["One print is not a trend", "Check revisions before forming a strong view"]
  },
  {
    id: "payrolls-unemployment-wages",
    title: "Payrolls / Unemployment / Wages Chain",
    trigger: "Payrolls surprise weak or strong.",
    meaning: "The jobs print changes the growth story and the inflation story at the same time.",
    nextCheck: "Check unemployment, revisions, average hourly earnings, and average weekly hours before deciding what the headline means.",
    marketConfirmation: "Then confirm in claims, the 2Y, and credit spreads. Stable credit means slowdown; wider credit means stress is spreading.",
    commonMistake: "Calling recession from the headline payroll number without checking revisions, hours, or the unemployment move.",
    cautions: ["Check revisions before forming a strong view", "Confirm with rates and credit before calling a regime turn"]
  },
  {
    id: "claims-early-warning",
    title: "Claims Early-Warning Chain",
    trigger: "Initial claims start to rise or break above the recent range.",
    meaning: "Claims are often the early warning that labor demand is cooling before payrolls fully show it.",
    nextCheck: "Check continuing claims, payroll revisions, unemployment, and whether the increase is broad rather than holiday noise.",
    marketConfirmation: "Confirm with defensives outperforming, HY spreads widening, and a softer front end in rates.",
    commonMistake: "Treating one noisy weekly spike as a regime break when continuing claims never confirm it.",
    cautions: ["One print is not a trend", "Confirm with rates and credit before calling a regime turn"]
  },
  {
    id: "ism-manufacturing-services",
    title: "ISM Manufacturing / Services Chain",
    trigger: "ISM moves sharply above or below the recent trend.",
    meaning: "That usually changes the early growth direction before the slower hard data catches up.",
    nextCheck: "Check new orders, employment, and prices paid, then compare the signal with payrolls, retail demand, and industrial production.",
    marketConfirmation: "Cyclicals, copper, and the 10Y should usually confirm a genuine growth turn while credit stays calm.",
    commonMistake: "Treating the headline alone as the signal when the subcomponents or the services side disagree.",
    cautions: ["One print is not a trend", "Confirm with rates and credit before calling a regime turn"]
  },
  {
    id: "rates-curve",
    title: "2Y / 10Y / Curve Chain",
    trigger: "Treasury yields or the curve move sharply after data.",
    meaning: "The 2Y says policy repricing, the 10Y says discount-rate pressure, and the curve helps separate slowdown from reflation.",
    nextCheck: "Check whether the move is front-end led, real-yield led, or curve-shape led, then tie it back to inflation and growth data.",
    marketConfirmation: "Bull steepening with stable credit often fits a slowdown-soft-landing mix; bear steepening with sticky inflation fits reflation risk.",
    commonMistake: "Calling a bullish regime turn from a curve move without checking whether credit and equities agree.",
    cautions: ["Confirm with rates and credit before calling a regime turn"]
  },
  {
    id: "ig-hy-spreads",
    title: "IG / HY Spreads Chain",
    trigger: "Credit spreads tighten or widen materially.",
    meaning: "Credit is the trust layer. It tells you whether risk markets actually believe the macro story.",
    nextCheck: "Check whether IG and HY agree, then compare with claims, equities, and bank-sensitive parts of the market.",
    marketConfirmation: "Wider HY with weaker breadth and softer labor/growth data is a stronger warning than an equity wobble alone.",
    commonMistake: "Ignoring quiet credit deterioration because headline equity indices still look stable.",
    cautions: ["Confirm with rates and credit before calling a regime turn"]
  }
] as const;

export const viewBuilderScenarios: ViewBuilderScenario[] = [
  {
    id: "cool-inflation-resilient-growth",
    title: "Cooler inflation + resilient growth",
    setup: "Core inflation cools, claims stay contained, ISM stabilizes, and credit stays calm.",
    interpretation: "That usually fits a soft-landing interpretation rather than a hard-landing call.",
    confirmWith: "Check the 2Y easing without HY spreads blowing out.",
    avoid: "Do not assume the Fed is done if the core services details are still sticky."
  },
  {
    id: "hot-inflation-rates-up",
    title: "Hot core inflation + front-end repricing",
    setup: "CPI or Core PCE runs hot and the 2Y plus real yields rise together.",
    interpretation: "That often means Fed easing expectations are being pushed out, not just a noisy data wobble.",
    confirmWith: "Look for breakevens, the dollar, and duration-sensitive equities to react in the same direction.",
    avoid: "Do not overread a headline move that is mostly energy or base effects."
  },
  {
    id: "weaker-labor-credit-stable",
    title: "Weaker labor + credit still stable",
    setup: "Payrolls cool, claims edge higher, but IG and HY remain contained.",
    interpretation: "That can still be a benign slowdown rather than an immediate hard-landing signal.",
    confirmWith: "Check hours, revisions, and whether the curve bull steepens without stress in HY.",
    avoid: "Do not jump straight from weaker payrolls to recession."
  },
  {
    id: "weaker-labor-credit-worse",
    title: "Weaker labor + widening credit",
    setup: "Claims rise, payrolls weaken, unemployment drifts higher, and HY spreads widen.",
    interpretation: "That is a more serious hard-landing warning because the macro and market signals are aligning.",
    confirmWith: "Look for defensives to lead, the 2Y to fall, and breadth to deteriorate.",
    avoid: "Do not call it only a rate-cut positive if credit is clearly disagreeing."
  }
] as const;

export const followUpLogicBySlug: Record<string, FollowUpLogic> = {
  "cpi-headline": {
    meaning: "Headline CPI changes the inflation tone first, but you still need the core details.",
    nextCheck: "Split headline vs core, then check shelter and the 3m annualized pace.",
    confirmation: "The 2Y, real yields, and breakevens move in the same direction.",
    invalidation: "Energy or food drives the move while the sticky core details stay calmer.",
    cautions: ["One print is not a trend"]
  },
  "core-cpi": {
    meaning: "Core CPI is a better read on persistent inflation pressure than the headline alone.",
    nextCheck: "Check shelter, services ex housing, and any meaningful revisions.",
    confirmation: "Front-end yields and real yields reprice together.",
    invalidation: "A one-month core pop never carries into the next few service-heavy prints.",
    cautions: ["Check revisions before forming a strong view"]
  },
  "core-pce": {
    meaning: "Core PCE is closer to the Fed reaction function than most single inflation prints.",
    nextCheck: "Check services ex housing, revisions, and whether monthly momentum is cooling.",
    confirmation: "Fed-cut odds and the 2Y move with the print.",
    invalidation: "A softer print comes only from volatile components while sticky services stay hot.",
    cautions: ["One print is not a trend"]
  },
  "nonfarm-payrolls": {
    meaning: "Payrolls tells you whether growth is still creating jobs fast enough to support demand.",
    nextCheck: "Check unemployment, revisions, wages, and average weekly hours right after the headline.",
    confirmation: "Claims, the 2Y, and credit spreads confirm the same growth message.",
    invalidation: "The headline is weak but revisions, hours, and claims do not confirm a downturn.",
    cautions: ["Check revisions before forming a strong view"]
  },
  "unemployment-rate": {
    meaning: "Unemployment shows whether labor slack is actually opening up.",
    nextCheck: "Check participation, payroll revisions, and claims before reading it as stress.",
    confirmation: "The 2Y falls and credit stops staying completely calm.",
    invalidation: "The rate rises because participation improved rather than layoffs accelerating.",
    cautions: ["One print is not a trend"]
  },
  "avg-hourly-earnings": {
    meaning: "Wages link labor tightness to future services inflation pressure.",
    nextCheck: "Compare wages with payrolls, hours, and core services inflation.",
    confirmation: "Hot wages with firmer front-end yields usually means policy repricing.",
    invalidation: "Composition effects lift wages while hours and hiring are softening.",
    cautions: ["Check revisions before forming a strong view"]
  },
  "initial-claims": {
    meaning: "Claims is the fastest official read on whether layoffs are starting to build.",
    nextCheck: "Check continuing claims, payroll revisions, and whether the move breaks the recent range.",
    confirmation: "Defensives lead, the front end eases, and HY starts to widen.",
    invalidation: "A one-week spike fades immediately and continuing claims never confirm it.",
    cautions: ["One print is not a trend"]
  },
  "ism-manufacturing": {
    meaning: "Manufacturing PMI is an early direction check for the factory and inventory cycle.",
    nextCheck: "Read new orders, employment, and prices paid before trusting the headline.",
    confirmation: "Cyclicals, copper, and the 10Y usually confirm a genuine turn.",
    invalidation: "The headline improves but new orders and credit do not follow.",
    cautions: ["Confirm with rates and credit before calling a regime turn"]
  },
  "ism-services": {
    meaning: "Services PMI tells you whether domestic demand is still carrying the expansion.",
    nextCheck: "Check employment, prices paid, payrolls, and consumer demand.",
    confirmation: "Rates stay firm and credit stays calm if the demand story is real.",
    invalidation: "A bounce in the headline is not matched by payrolls or consumer data.",
    cautions: ["One print is not a trend"]
  },
  "us-2y-treasury": {
    meaning: "The 2Y is the cleanest market signal for changing Fed expectations.",
    nextCheck: "Tie the move back to inflation, labor, and Fed-cut pricing before reacting.",
    confirmation: "The dollar and real yields move with it, not against it.",
    invalidation: "The move is isolated to the curve while the front-end macro story barely changes.",
    cautions: ["Confirm with rates and credit before calling a regime turn"]
  },
  "us-10y-treasury": {
    meaning: "The 10Y tells you how hard the discount-rate pressure is hitting longer-duration assets.",
    nextCheck: "Split the move into real yields vs breakevens and then check growth data.",
    confirmation: "Mortgage rates and duration-sensitive equities react in the same direction.",
    invalidation: "Auction or supply noise moves the 10Y without broader confirmation.",
    cautions: ["One print is not a trend"]
  },
  "curve-2s10s": {
    meaning: "The curve helps separate slowdown, reflation, and policy normalization stories.",
    nextCheck: "Ask whether steepening is bull or bear, then check HY and claims.",
    confirmation: "Bull steepening with calm credit is softer-landing friendly.",
    invalidation: "Bear steepening from inflation fear is mistaken for growth relief.",
    cautions: ["Confirm with rates and credit before calling a regime turn"]
  },
  "ig-spreads": {
    meaning: "IG spreads show whether quality credit accepts the macro story.",
    nextCheck: "Compare with HY, bank-sensitive assets, and earnings revisions.",
    confirmation: "Tighter IG with firm breadth supports the soft-landing case.",
    invalidation: "Equities rally while IG quietly widens.",
    cautions: ["Confirm with rates and credit before calling a regime turn"]
  },
  "hy-spreads": {
    meaning: "HY spreads are the faster warning light for real risk appetite.",
    nextCheck: "Check IG, small caps, breadth, and labor stress data.",
    confirmation: "Wider HY with weaker breadth and softer labor data is a stronger warning.",
    invalidation: "A small spread move fades while equities and IG stay healthy.",
    cautions: ["One print is not a trend"]
  },
  "mortgage-rates": {
    meaning: "Mortgage rates show whether the bond market move is reaching households.",
    nextCheck: "Check housing starts, permits, and builder-sensitive data next.",
    confirmation: "Lower rates start to improve housing data with a lag.",
    invalidation: "Rates fall briefly but housing demand and permits never respond.",
    cautions: ["Transmission into the real economy takes time"]
  },
  "fed-balance-sheet": {
    meaning: "The balance sheet sets the background pace of QT or QE, but not the whole liquidity impulse by itself.",
    nextCheck: "Check RRP, TGA, and reserves before deciding whether QT is actually biting.",
    confirmation: "Net liquidity, credit spreads, and breadth lean in the same direction.",
    invalidation: "The balance sheet shrinks, but RRP runoff or easier credit keeps markets supported.",
    cautions: ["One plumbing series is not the whole liquidity picture"]
  },
  "rrp-balance": {
    meaning: "RRP tells you how much cash buffer is still sitting at the Fed rather than in markets.",
    nextCheck: "Check whether falling RRP is offsetting QT or whether reserves are becoming the marginal absorber.",
    confirmation: "Net liquidity and reserve balances improve together.",
    invalidation: "RRP falls, but reserves, credit, and repo conditions do not improve.",
    cautions: ["The buffer matters most when it gets small"]
  },
  "tga-balance": {
    meaning: "The TGA shows whether Treasury cash is draining or injecting liquidity into markets.",
    nextCheck: "Check auction size, tax dates, and net liquidity before reacting to one daily move.",
    confirmation: "TGA rebuilding lines up with softer liquidity, wider spreads, or tighter conditions.",
    invalidation: "The TGA rises briefly, but RRP and reserves absorb it cleanly.",
    cautions: ["Treasury cash swings can be noisy around tax and settlement dates"]
  },
  "net-liquidity": {
    meaning: "Net liquidity is the practical composite for whether the plumbing is helping or hurting risk assets.",
    nextCheck: "Check reserves, HY spreads, and breadth to see whether the liquidity impulse is reaching markets.",
    confirmation: "Better net liquidity lines up with tighter credit and broader participation.",
    invalidation: "The model improves, but credit and internals keep deteriorating.",
    cautions: ["Confirm with rates and credit before calling a regime turn"]
  },
  "financial-conditions-index": {
    meaning: "The FCI compresses rates, spreads, the dollar, and equities into one operating-environment check.",
    nextCheck: "Look inside the move through HY spreads, the dollar, and rate volatility.",
    confirmation: "Easier conditions line up with calmer credit and healthier internals.",
    invalidation: "The index eases, but the quality of the move is poor because credit still disagrees.",
    cautions: ["The direction matters more than one absolute level"]
  },
  "reserve-balances": {
    meaning: "Reserve balances tell you whether the banking system still has cash buffers to absorb QT and funding stress.",
    nextCheck: "Check RRP, repo stress, and bank credit growth next.",
    confirmation: "Stable reserves line up with calmer funding and steadier credit creation.",
    invalidation: "Reserves look stable, but repo stress and bank lending say the margin is tightening.",
    cautions: ["Reserves matter most when the buffer is getting scarce"]
  },
  "bank-credit-growth": {
    meaning: "Bank credit growth tells you whether liquidity is still reaching households and businesses.",
    nextCheck: "Check loan standards, HY spreads, and regional-bank-sensitive risk assets.",
    confirmation: "Credit growth and easier standards improve together.",
    invalidation: "Bank credit stays weak even though broad risk assets look fine.",
    cautions: ["Credit transmission matters more than one liquidity headline"]
  },
  "loan-standards": {
    meaning: "Loan standards are the bridge between financial conditions and future growth.",
    nextCheck: "Check bank credit growth, HY spreads, and small caps before assuming the drag is real.",
    confirmation: "Tighter standards line up with weaker credit creation and risk appetite.",
    invalidation: "Standards stay tight on paper, but lending and spreads never confirm the slowdown.",
    cautions: ["Standards usually matter with a lag"]
  },
  "fed-funds-upper": {
    meaning: "The policy rate is the anchor for financing conditions, but the path matters more than the level alone.",
    nextCheck: "Check the next three FOMC meetings, the 2Y, and core inflation.",
    confirmation: "Fed pricing and the front end both move with the same message.",
    invalidation: "The policy rate is unchanged and the market is reacting to growth fear instead.",
    cautions: ["Path and communication matter more than one meeting level"]
  },
  dxy: {
    meaning: "DXY is a broad read on whether the dollar is tightening or easing global financial conditions.",
    nextCheck: "Check real yields, US rate pricing, and China-sensitive assets.",
    confirmation: "A stronger dollar lines up with softer commodities and tighter risk conditions.",
    invalidation: "The dollar moves, but FX crosses, commodities, and rates do not confirm the message.",
    cautions: ["A weaker dollar is not always bullish if US growth is rolling over"]
  },
  eurusd: {
    meaning: "EURUSD tells you whether broad dollar moves are showing up in the biggest developed-market cross.",
    nextCheck: "Compare it with DXY, ECB pricing, and US real yields.",
    confirmation: "EURUSD and DXY move together while other major crosses confirm the same dollar story.",
    invalidation: "EUR-specific news drives the move without broader FX confirmation.",
    cautions: ["One major cross is not the full dollar picture"]
  },
  usdjpy: {
    meaning: "USDJPY is a key spillover gauge for carry trades, Japan policy, and global duration.",
    nextCheck: "Check BoJ tone, US real yields, and rate volatility.",
    confirmation: "A sharp yen move also changes carry-sensitive risk appetite and global yields.",
    invalidation: "USDJPY moves on local headlines but broad risk and rates barely care.",
    cautions: ["BoJ surprises can matter more than the daily macro headline"]
  },
  usdcnh: {
    meaning: "USDCNH is a fast pressure gauge for China growth sensitivity and Asia dollar stress.",
    nextCheck: "Check China PMIs, copper, and the broad dollar next.",
    confirmation: "A weaker yuan lines up with softer industrial metals and tighter EM-sensitive risk.",
    invalidation: "USDCNH drifts, but China activity and metals do not confirm the warning.",
    cautions: ["China-sensitive FX should be read with commodity confirmation"]
  },
  "wti-oil": {
    meaning: "Oil can complicate disinflation, but the macro meaning depends on whether the move is supply or demand driven.",
    nextCheck: "Check breakevens, gasoline, and whether copper confirms the growth part of the move.",
    confirmation: "Oil rises with breakevens and broader commodity strength.",
    invalidation: "A headline supply shock lifts oil while broader growth signals stay soft.",
    cautions: ["Do not confuse supply shock inflation with broad demand strength"]
  },
  "natural-gas": {
    meaning: "Natural gas is a spillover check on whether energy pressure is broadening beyond oil.",
    nextCheck: "Check Europe, weather shocks, and other energy inputs before calling it macro-wide.",
    confirmation: "Gas, oil, and inflation-sensitive assets all move together.",
    invalidation: "Gas jumps on idiosyncratic weather or storage noise while the rest of the complex stays calm.",
    cautions: ["Energy markets are noisy and headline-driven"]
  },
  copper: {
    meaning: "Copper is one of the fastest market checks on global industrial demand.",
    nextCheck: "Check China PMIs, the dollar, and cyclical leadership.",
    confirmation: "Copper strength lines up with better PMIs, firmer yields, and healthier cyclicals.",
    invalidation: "Copper bounces, but PMIs, rates, and leadership do not follow through.",
    cautions: ["Copper works best as confirmation, not a standalone forecast"]
  },
  "copper-gold-ratio": {
    meaning: "The copper-gold ratio is a compact market read on cyclical confidence versus defensive demand.",
    nextCheck: "Check PMIs, the 10Y, and cyclicals before trusting the signal.",
    confirmation: "The ratio improves while yields and growth-sensitive leadership firm.",
    invalidation: "The ratio moves on one metal only while the broader macro tape stays unchanged.",
    cautions: ["Ratios work best when their underlying markets agree"]
  },
  gold: {
    meaning: "Gold tells you whether the market wants monetary hedges, inflation hedges, or stress hedges.",
    nextCheck: "Check real yields and the dollar before assigning one simple meaning to the move.",
    confirmation: "Gold rises with falling real yields or broader defensive demand.",
    invalidation: "Gold moves on positioning noise while real yields and the dollar barely change.",
    cautions: ["Gold can fit both risk-on liquidity and defensive macro stories"]
  },
  "sofr-implied-cuts": {
    meaning: "Implied cuts show how much easing the market is pricing into the next year.",
    nextCheck: "Check the 2Y, claims, and core inflation to see why the path moved.",
    confirmation: "Front-end yields and the implied path move together.",
    invalidation: "Cut pricing changes, but the 2Y and macro data barely move.",
    cautions: ["More cuts priced is not automatically bullish"]
  },
  "terminal-rate-pricing": {
    meaning: "Terminal rate pricing shows whether the market thinks the Fed ceiling is moving.",
    nextCheck: "Check the 2Y and real yields to see whether the repricing is hawkish or benign.",
    confirmation: "Higher terminal pricing lines up with a stronger front end and firmer real yields.",
    invalidation: "The estimate wiggles, but the rest of the curve and credit stay unchanged.",
    cautions: ["Terminal estimates are useful only when other rate signals agree"]
  },
  "next-three-fomc-path": {
    meaning: "The next-three-meeting path is the cleanest short-horizon read on near-term Fed repricing.",
    nextCheck: "Check the 2Y and payroll or CPI details to see what drove the move.",
    confirmation: "The path shifts and front-end yields reprice immediately.",
    invalidation: "A small meeting-path move fades without confirmation from rates or macro data.",
    cautions: ["Near-term pricing can swing hard around one print"]
  },
  "ten-year-real-yield": {
    meaning: "Real yields tell you whether the long-end move is tightening the discount rate or just changing inflation expectations.",
    nextCheck: "Compare the move with the 10Y nominal yield and breakevens.",
    confirmation: "Higher real yields line up with tighter duration-sensitive valuations.",
    invalidation: "Nominals move, but real yields and equity duration barely react.",
    cautions: ["Real yields matter more for valuation than nominal headlines alone"]
  },
  "curve-3m10y": {
    meaning: "The 3m10y curve is the stricter recession-warning curve because it compares the long end to actual policy restriction.",
    nextCheck: "Check claims, credit spreads, and whether the steepening is coming from easier policy or inflation fear.",
    confirmation: "A healthier curve lines up with calmer credit and a softer front end.",
    invalidation: "The curve steepens for the wrong reason because long yields rise on inflation pressure.",
    cautions: ["Curve normalization is only helpful when credit agrees"]
  },
  "china-pmi": {
    meaning: "China PMI is the quickest offshore growth check for industrial demand and commodity sensitivity.",
    nextCheck: "Check copper, USDCNH, and export-sensitive cyclicals.",
    confirmation: "PMI improvement lines up with metals and China-sensitive FX.",
    invalidation: "The survey improves, but commodities and FX do not believe it.",
    cautions: ["One China survey bounce is not enough by itself"]
  },
  "eurozone-pmi": {
    meaning: "Eurozone PMI shows whether overseas growth is broadening enough to matter for the global cycle.",
    nextCheck: "Check EURUSD, ECB pricing, and manufacturing-sensitive sectors.",
    confirmation: "Europe improves while EURUSD and cyclicals stop looking defensive.",
    invalidation: "The survey improves, but Europe-sensitive assets and trade indicators do not follow.",
    cautions: ["Europe needs confirmation from hard data and energy prices"]
  },
  "boj-policy": {
    meaning: "BoJ policy changes matter because they can hit the yen, carry trades, and global duration all at once.",
    nextCheck: "Check USDJPY, global yields, and rate volatility.",
    confirmation: "A BoJ shift changes the yen and the broader carry backdrop quickly.",
    invalidation: "The message sounds important, but USDJPY and rates barely react.",
    cautions: ["Japan policy can create spillovers far larger than its local headlines suggest"]
  },
  "major-central-bank-tracker": {
    meaning: "This composite tells you whether global policy is becoming a liquidity tailwind or headwind on net.",
    nextCheck: "Check whether the Fed, ECB, and BoJ are actually moving in the same direction.",
    confirmation: "The composite improves while risk appetite and global duration both respond.",
    invalidation: "One central bank shifts, but the rest of the policy complex stays split.",
    cautions: ["Synchronized policy shifts matter more than isolated cuts"]
  },
  "global-growth-cross-check": {
    meaning: "This cross-check helps you avoid making a domestic call that the rest of the world does not confirm.",
    nextCheck: "Look at PMIs, trade-sensitive commodities, and the dollar together.",
    confirmation: "Offshore data, commodities, and risk leadership all lean the same way.",
    invalidation: "The composite improves, but FX and commodities keep signaling caution.",
    cautions: ["Broad confirmation is more reliable than one-country optimism"]
  },
  breadth: {
    meaning: "Breadth tells you whether participation is broad enough to trust the index move.",
    nextCheck: "Check equal-weight, small caps, and HY spreads next.",
    confirmation: "Broader participation lines up with healthier leadership and calm credit.",
    invalidation: "The index rises, but breadth never improves underneath.",
    cautions: ["A headline rally is fragile when participation stays narrow"]
  },
  "equal-weight-vs-cap-weight": {
    meaning: "This ratio shows whether the rally is broadening beyond the biggest companies.",
    nextCheck: "Check breadth, small caps, and cyclical leadership.",
    confirmation: "Equal-weight starts to improve at the same time breadth broadens.",
    invalidation: "Mega-cap leadership keeps doing all the work while the ratio stalls.",
    cautions: ["Broadening matters more than one-day relative moves"]
  },
  "small-caps-vs-large-caps": {
    meaning: "Small caps are a useful confidence check on domestic growth and financing conditions.",
    nextCheck: "Check HY spreads, the 2Y, and bank-sensitive risk next.",
    confirmation: "Small caps improve with tighter spreads and broader breadth.",
    invalidation: "Small caps bounce briefly, but credit and breadth never confirm it.",
    cautions: ["Small caps can lag until financing conditions truly ease"]
  },
  "cyclical-vs-defensive": {
    meaning: "Leadership tells you whether investors are leaning into growth confidence or hiding in safer sectors.",
    nextCheck: "Check breadth, yields, and PMIs to see whether the rotation is real.",
    confirmation: "Cyclicals lead while breadth and growth-sensitive data improve.",
    invalidation: "A short sector burst fades because yields, PMIs, or breadth do not confirm.",
    cautions: ["Leadership rotations are strongest when rates and macro agree"]
  },
  "etf-flows": {
    meaning: "ETF flows tell you whether investor cash is reinforcing the market move or quietly fading.",
    nextCheck: "Check whether flows are broad or concentrated in one crowded theme.",
    confirmation: "Flows broaden alongside better breadth and tighter credit.",
    invalidation: "Headline inflows stay strong, but participation and credit quality do not improve.",
    cautions: ["Flows confirm momentum; they do not replace macro"]
  },
  "buyback-window": {
    meaning: "The buyback window shows whether a mechanical corporate bid is active underneath equities.",
    nextCheck: "Check earnings blackout timing, ETF flows, and market breadth.",
    confirmation: "An open window lines up with steadier equity demand and milder drawdowns.",
    invalidation: "Buybacks reopen, but breadth and price action still weaken quickly.",
    cautions: ["Buybacks can cushion, but they do not override bad macro"]
  },
  "cftc-cot": {
    meaning: "COT tells you when speculative positioning is becoming stretched in macro markets.",
    nextCheck: "Check whether price action is still confirming the positioning trend.",
    confirmation: "Crowded positioning starts to matter when price and narrative stop agreeing.",
    invalidation: "Spec exposure looks extended, but price keeps broadening without stress.",
    cautions: ["Positioning extremes are not timing tools by themselves"]
  },
  "crowding-flags": {
    meaning: "Crowding tells you whether the market is becoming vulnerable to a sharper unwind if the story changes.",
    nextCheck: "Check breadth, skew, and whether leadership is narrowing.",
    confirmation: "Crowding rises while participation narrows and volatility stops falling.",
    invalidation: "Crowding looks elevated, but breadth keeps improving and rotation broadens.",
    cautions: ["Crowding is most dangerous when liquidity is tightening too"]
  },
  "thirteen-f-tracker": {
    meaning: "13F data is a slow-moving check on where institutional capital is already leaning.",
    nextCheck: "Check crowding, ETF flows, and overlap in leadership themes.",
    confirmation: "Concentrated ownership lines up with narrow participation and complacency.",
    invalidation: "Holdings look crowded, but the tape keeps broadening rather than narrowing.",
    cautions: ["13F data is delayed and best used for structure, not timing"]
  },
  vix: {
    meaning: "VIX is the fast fear gauge, but low volatility is only healthy when participation stays broad.",
    nextCheck: "Check breadth, HY spreads, and upcoming event risk.",
    confirmation: "A low or falling VIX lines up with calm credit and healthier internals.",
    invalidation: "VIX stays low while breadth and credit quietly deteriorate.",
    cautions: ["Low vol can also mean complacency"]
  },
  "move-index": {
    meaning: "MOVE tells you whether rate volatility is becoming the hidden source of cross-asset stress.",
    nextCheck: "Check the 2Y, auction calendar, and equity-duration sensitivity.",
    confirmation: "Higher MOVE lines up with shakier duration and tighter financial conditions.",
    invalidation: "MOVE spikes briefly, but front-end rates and risk assets shrug it off.",
    cautions: ["Rate volatility often matters before equity volatility does"]
  }
};

export function getFollowUpLogic(slug: string) {
  return followUpLogicBySlug[slug];
}

const logicChainIdByIndicatorSlug: Record<string, string> = {
  "cpi-headline": "cpi-core-pce",
  "core-cpi": "cpi-core-pce",
  "ppi-final-demand": "cpi-core-pce",
  "core-pce": "cpi-core-pce",
  "nonfarm-payrolls": "payrolls-unemployment-wages",
  "unemployment-rate": "payrolls-unemployment-wages",
  "avg-hourly-earnings": "payrolls-unemployment-wages",
  "initial-claims": "claims-early-warning",
  "ism-manufacturing": "ism-manufacturing-services",
  "ism-services": "ism-manufacturing-services",
  "industrial-production": "ism-manufacturing-services",
  "us-2y-treasury": "rates-curve",
  "us-10y-treasury": "rates-curve",
  "curve-2s10s": "rates-curve",
  "curve-3m10y": "rates-curve",
  "ten-year-real-yield": "rates-curve",
  "fed-funds-upper": "rates-curve",
  "sofr-implied-cuts": "rates-curve",
  "terminal-rate-pricing": "rates-curve",
  "next-three-fomc-path": "rates-curve",
  "ig-spreads": "ig-hy-spreads",
  "hy-spreads": "ig-hy-spreads"
};

export function getLogicChainById(id: string) {
  return logicChains.find((chain) => chain.id === id);
}

export function getLogicChainForIndicator(slug: string) {
  const chainId = logicChainIdByIndicatorSlug[slug];

  if (!chainId) {
    return undefined;
  }

  return getLogicChainById(chainId);
}

export function getLogicChainHref(id: string) {
  return `/macro-flow#${id}`;
}
