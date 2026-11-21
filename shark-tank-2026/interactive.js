/* WFUSB MSBA Shark Tank interactive enhancement, v1.0.
   All scenarios, datasets, and stakeholder remarks are synthetic classroom material.
   No analytics, tracking, servers, or student-response storage. */
(function () {
  'use strict';
  const payload = document.getElementById('payload');
  const host = document.getElementById('case');
  if (!payload || !host) return;
  const cases = JSON.parse(payload.textContent);
  const id = new URLSearchParams(location.search).get('case');
  const c = cases.find(x => x.id === id) || cases[0];
  const E = text => String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const num = text => {
    const s = String(text ?? '').trim().replace(/[,$%]/g, '');
    const n = Number.parseFloat(s.replace(/\s/g, ''));
    if (!Number.isFinite(n)) return NaN;
    if (/^[-+]?\d+(?:\.\d+)?k\b/i.test(s)) return n * 1000;
    if (/^[-+]?\d+(?:\.\d+)?m\b/i.test(s)) return n * 1000000;
    return n;
  };
  const format = (n, digits = 0) => Number.isFinite(n) ? new Intl.NumberFormat('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n) : '—';
  const dollars = n => '$' + format(n);
  const pct = n => format(n, 1) + '%';
  const rowNum = (r, col) => num(r[col]);
  const allRows = index => c.tables[index]?.[2] || [];
  const nameOf = row => String(row?.[0] || 'Selected option');
  const safe = v => Number.isFinite(v) ? v : 0;
  const clip = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  const models = {
    'capital-one': {
      pick: 0, label: 'Customer segment', a: ['Outreach budget', 10000, 120000, 60000, 5000, '$'],
      b: ['Assumed incremental retention improvement', 0.5, 5, 2, 0.5, 'pp'],
      explain: 'Outreach capacity = min(accounts, budget ÷ $5.50). Potential closures avoided = contacts × assumed retention improvement. This is a hypothesis, not a forecast.'
    },
    'global-lending-services': {
      pick: 0, label: 'Loan tier', a: ['Support outreach budget', 5000, 80000, 40000, 5000, '$'],
      b: ['Assumed extra cure rate from outreach', 1, 20, 6, 1, 'pp'],
      explain: 'Exercise-only assumption: $20 per outreach. Incremental cures = contacted delinquent loans × assumed additional cure percentage; effects require testing.'
    },
    'ralph-lauren': {
      pick: 0, label: 'Product category', a: ['Potential conversion recovery', 0.1, 2, 0.8, 0.1, 'pp'],
      b: ['Assumed contribution margin', 15, 55, 30, 5, '%'],
      explain: 'Additional orders = current visits × conversion-point recovery. Modeled gross contribution = new orders × average order value × assumed contribution margin; excludes pilot cost and returns.'
    },
    'the-home-depot': {
      pick: 1, label: 'Transfer lane', a: ['Emergency truckloads', 1, 4, 2, 1, 'trucks'],
      b: ['Assumed share of transferred units sold', 20, 100, 70, 10, '%'],
      explain: 'Truckloads × 1,000 units per truck; recovered sales × $28 gross margin less transfer costs. Donor minimum of 10 days of stock and total truck capacity are checked.'
    },
    'deloitte': {
      pick: 0, label: 'Service journey', a: ['Target reduction in resolution time', 5, 45, 15, 5, '%'],
      b: ['Tickets affected by pilot', 20, 100, 60, 10, '%'],
      explain: 'Illustrative volume × change in median time × reach. This is only a scenario proxy for ticket-minutes, not validated labor-hours savings.'
    },
    'pwc': {
      pick: 0, label: 'Division for first audit', a: ['Share of cases reconciled', 10, 100, 60, 10, '%'],
      b: ['Assumed records requiring correction', 1, 25, 8, 1, '%'],
      explain: 'Cases reviewed = division cases × audit coverage; assumed records needing correction = reviewed × discrepancy rate. No standardized on-time performance can be computed without consistent clock definitions.'
    },
    'inmar-intelligence': {
      pick: 0, label: 'Promotional treatment', a: ['Share of control-adjusted lift that holds up', 10, 100, 60, 10, '%'],
      b: ['Campaign cost multiplier', 50, 150, 100, 10, '%'],
      explain: 'Proxy net contribution = households × baseline spend × (exposed lift − matched-control lift) × assumed validation share × contribution margin − adjusted campaign cost. Not a causal ROI estimate.'
    },
    'epic': {
      pick: 0, label: 'Clinical unit', a: ['Target appropriate workflow adoption', 45, 100, 80, 5, '%'],
      b: ['Share of unit encounters in the pilot', 20, 100, 60, 10, '%'],
      explain: 'Additional appropriately completed workflows/week = eligible encounters × pilot coverage × max(target adoption − current adoption, 0). Any change requires clinical safety review.'
    },
    'wellnecity': {
      pick: 0, label: 'Covered-member segment', a: ['Hypothetical reduction in coded ED visits / 1,000', 2, 40, 15, 1, 'per 1k'],
      b: ['Share of segment reached', 10, 100, 50, 10, '%'],
      explain: 'Scenario visits = members reached × assumed reduction per 1,000 / 1,000. This is a coding proxy, not a clinical estimate of avoidable or unnecessary emergency care.'
    },
    'cigna': {
      pick: 0, label: 'Member-service queue', a: ['Assumed reduction in median response', 1, 25, 10, 1, 'min'],
      b: ['Share of contacts affected', 10, 100, 60, 10, '%'],
      explain: 'The median response for affected contacts is modeled lower by the chosen minutes. Number of contacts × median change is a rough exposure illustration, not measured total wait time.'
    },
    'flexport': {
      pick: null, label: 'Upgrade route', a: ['Ocean-standard shipments upgraded', 10, 200, 120, 10, 'shipments'],
      b: ['Share of historical rate gap expected to hold', 10, 100, 60, 10, '%'],
      explain: 'Modeled late shipments prevented = upgraded shipments × (41% ocean-standard late − 23% priority late) × assumed realization share. Premium cost = upgrades × $650.'
    },
    'red-ventures': {
      pick: 0, label: 'Acquisition channel', a: ['Incremental test spending', 5000, 60000, 30000, 5000, '$'],
      b: ['Hypothetical marginal efficiency vs historical average', 50, 150, 100, 10, '%'],
      explain: 'Expected qualified-lead equivalents = incremental spend / observed average cost per qualified lead × assumed marginal efficiency. Not causal; attribution and lead quality must be tested.'
    },
    'tepper-sports': {
      pick: 0, label: 'Fan cohort', a: ['Opt-in accounts invited', 100, 2000, 1000, 100, 'accounts'],
      b: ['Hypothetical additional renewal rate', 1, 20, 8, 1, 'pp'],
      explain: 'Additional renewals = invited accounts × assumed improvement (percentage points). Contribution = additional renewals × cohort contribution per renewal. Pilot costs and control groups still matter.'
    },
    'charlotte-hornets': {
      pick: null, label: null, a: ['Decision weight: perimeter defense', 0, 80, 45, 5, '%'],
      b: ['Decision weight: availability', 0, 20, 15, 5, '%'],
      explain: 'Demonstration preference score = defense weight × matchup difficulty + availability weight × games played share + remaining weight × shooting-based offense index. Metrics and candidates are entirely fictional; weighting is subjective.'
    }
  };
  const model = models[c.id];
  if (!model) return;

  function assess(choice, a, b) {
    const t = c.tables;
    const r = model.pick === null ? [] : allRows(model.pick)[choice];
    let metrics = [], summary = '', caution = '', evidence = '';
    const add = (label, value) => metrics.push({ label, value: String(value) });
    switch (c.id) {
      case 'capital-one': {
        const accounts = rowNum(r, 1), previous = rowNum(r, 2), current = rowNum(r, 3);
        const contacts = Math.min(accounts, Math.floor(a / 5.5));
        const avoided = contacts * b / 100;
        add('Accounts potentially reached', format(contacts));
        add('Hypothetical closures avoided', format(avoided));
        add('Estimated outreach cost', dollars(contacts * 5.5));
        add('Attrition change (prior to current)', '+' + format(current - previous, 1) + ' pp');
        summary = `Target ${nameOf(r)} with up to ${format(contacts)} personalized contacts; test an assumed ${format(b, 1)}-point incremental retention gain.`;
        evidence = `In the simulated portfolio, ${nameOf(r)} attrition rose from ${previous}% to ${current}%. Under a ${dollars(a)} outreach cap, at most ${format(contacts)} accounts could be contacted at $5.50 each.`;
        caution = 'Do not treat a correlation between complaints and churn as a cause. Use an eligible holdout to measure incremental retention.';
        break;
      }
      case 'global-lending-services': {
        const loans = rowNum(r, 1), prior = rowNum(r, 2), current = rowNum(r, 3);
        const delinquent = loans * current / 100;
        const reached = Math.min(delinquent, Math.floor(a / 20));
        add('Currently 30+ DPD (estimated)', format(delinquent));
        add('Hypothetical reachable accounts', format(reached));
        add('Incremental cures under assumption', format(reached * b / 100));
        summary = `Pilot supportive outreach for ${nameOf(r)}; the assumed ${b}-point cure improvement needs a controlled comparison.`;
        evidence = `Simulated ${nameOf(r)} 30+ DPD rose from ${prior}% to ${current}%, about ${format(loans * (current-prior)/100)} more accounts.`;
        caution = 'The $20 contact price is an explicit teaching assumption, not case-provided data. Ensure fair-servicing and borrower-welfare safeguards.';
        break;
      }
      case 'ralph-lauren': {
        const visits = rowNum(r, 1), oldC = rowNum(r, 2), newC = rowNum(r, 3);
        const index = choice;
        const aov = rowNum(t[1][2][index], 1);
        const orders = visits * a / 100;
        add('Hypothetical additional orders', format(orders));
        add('Gross incremental revenue', dollars(orders * aov));
        add('Modeled contribution before test cost', dollars(orders * aov * b / 100));
        add('Observed conversion-point decline', format(oldC-newC, 1) + ' pp');
        summary = `Test ${nameOf(r)} interventions against ${format(a,1)} conversion points of potential recovery; protect margin and returns.`;
        evidence = `${nameOf(r)} visits: ${format(visits)}; conversion fell from ${oldC}% to ${newC}%; average order value is ${dollars(aov)}.`;
        caution = 'Modeled contribution is gross of the $40,000 test budget and returns; changes in visitor mix may confound before/after comparisons.';
        break;
      }
      case 'the-home-depot': {
        const lanes = [['Midwest', 'Southeast'], ['Northeast', 'Southeast'], ['Midwest', 'West'], ['Northeast', 'West']];
        const pair = lanes[choice];
        const region = {Southeast:[480,2400], Northeast:[310,5580], Midwest:[250,6250], West:[390,2730]};
        const [demand, stock] = region[pair[0]];
        const movable = Math.max(0, stock - 10*demand);
        const truckCost = rowNum(r, 3), units = a*1000;
        const gross = units * b/100 * 28;
        add('Proposed transfer', format(units) + ' units');
        add('Donor surplus over 10-day reserve', format(movable) + ' units');
        add('Modeled gross margin net of freight', dollars(gross - a*truckCost));
        add('Transfer freight cost', dollars(a*truckCost));
        summary = `${nameOf(r)}: ${a} truck(s) and ${format(b)}% of units assumed to become incremental sales.`;
        evidence = `The selected donor has ${format(stock/demand,1)} days of cover before transfer; the rule requires 10 days afterward.`;
        caution = units > movable ? 'NOT FEASIBLE: the proposed trucks would breach the donor’s 10-day inventory floor. Reduce trucks or choose another lane.' : 'Capacity passes the 10-day donor floor, but confirm destination demand and that modeled sales are incremental.';
        break;
      }
      case 'deloitte': {
        const vol = rowNum(r,1), before=rowNum(r,2), after=rowNum(r,3);
        const minutesSaved = Math.max(0,after*a/100), affected=vol*b/100;
        add('Tickets in selected journey / month', format(vol));
        add('Pilot-reached tickets (assumed)', format(affected));
        add('Illustrative lower median', format(after-minutesSaved,1)+' min');
        add('Illustrative ticket-minute proxy', format(affected*minutesSaved));
        summary = `Concentrate process redesign on ${nameOf(r)} and test a ${a}% reduction in post-launch median time.`;
        evidence = `The simulated ${nameOf(r)} median shifted from ${before} to ${after} minutes across ${format(vol)} monthly tickets.`;
        caution = 'Do not claim saved staff labor by multiplying ticket counts by medians; verify actual service-time distributions, resolution quality and case mix.';
        break;
      }
      case 'pwc': {
        const casesCount=rowNum(r,1), reported=rowNum(r,3), audited=casesCount*a/100, corrections=audited*b/100;
        add('Cases covered by first audit',format(audited));
        add('Assumed corrections to investigate',format(corrections));
        add('Locally reported on-time rate',format(reported,1)+'%');
        summary=`Start in ${nameOf(r)} with a ${a}% record audit, then define common start/stop events before any cross-division performance ranking.`;
        evidence=`${nameOf(r)} reported ${reported}% on time across ${format(casesCount)} cases, but exclusions and clock definitions differ by division.`;
        caution='There is deliberately NO new standardized on-time rate here: harmonized timestamps and eligible denominators are unavailable. The correction share is an assumed audit workload.';
        break;
      }
      case 'inmar-intelligence': {
        const households=rowNum(r,1), exp=rowNum(r,2), control=rowNum(r,3), cost=rowNum(r,4);
        const data=t[1][2][choice], base=rowNum(data,1), margin=rowNum(data,2);
        const controlAdjusted = exp-control;
        const gross = households*base*controlAdjusted/100*(a/100)*margin/100;
        const spend=cost*b/100;
        add('Control-adjusted lift proxy',format(controlAdjusted,1)+' pp');
        add('Modeled contribution before spend',dollars(gross));
        add('Adjusted campaign cost',dollars(spend));
        add('Proxy net contribution',dollars(gross-spend));
        summary=`For ${nameOf(r)}, stress-test how much of the ${format(controlAdjusted,1)}-point matched-control lift survives a better experiment.`;
        evidence=`Observed lift ${exp}% versus matched control ${control}%; simulated campaign spend ${dollars(cost)} and margin ${margin}%.`;
        caution='Matched controls are not randomized. Sales lift, net contribution and campaign ROI here are approximations, not verified causal effects.';
        break;
      }
      case 'epic': {
        const count=rowNum(r,1), current=rowNum(r,3), included=count*b/100;
        const possible = included*Math.max(0,a-current)/100;
        add('Pilot-eligible encounters / week',format(included));
        add('Current adoption',pct(current));
        add('Hypothetical additional uses / week',format(possible));
        summary=`For ${nameOf(r)}, consider a clinician-approved workflow test targeting ${a}% appropriate adoption among pilot-eligible encounters.`;
        evidence=`Adoption is ${current}% in ${nameOf(r)} across ${format(count)} eligible encounters/week; the unit reports ${rowNum(r,4)} extra clicks.`;
        caution=a<current?'The selected target is below current adoption; this slider shows zero additional uses.':'All adoption increases must preserve patient safety, actual workflow appropriateness, and clinical signoff.';
        break;
      }
      case 'wellnecity': {
        const members=rowNum(r,1), prev=rowNum(r,2), current=rowNum(r,3);
        const avg=rowNum(t[1][2][choice],1), contacted=members*b/100, visits=contacted*a/1000;
        add('People hypothetically reached',format(contacted));
        add('Modeled reduction in coded ED visits',format(visits,1));
        add('Claims-expenditure proxy (NOT savings)',dollars(visits*avg));
        add('Change in coded visits / 1,000',format(current-prev,1));
        summary=`Test voluntary care-navigation access for ${nameOf(r)}; evaluate real access and safety alongside coded utilization.`;
        evidence=`The coded visit rate in ${nameOf(r)} rose from ${prev} to ${current} per 1,000 members, with ${format(members)} covered members.`;
        caution='Coding does NOT establish that any individual ED visit was unnecessary; reducing legitimate emergency visits is not a goal. The dollar figure is not net savings.';
        break;
      }
      case 'cigna': {
        const contacts=rowNum(r,2), oldTime=rowNum(r,4), improved=Math.min(a,Math.max(0,oldTime-1));
        const touched=contacts*b/100;
        add('Affected monthly contacts (assumed)',format(touched));
        add('Modeled lower median response',format(oldTime-improved,1)+' min');
        add('Ticket-minute exposure proxy',format(touched*improved));
        summary=`Pilot one routing change in ${nameOf(r)}, aiming for an illustrative ${format(improved)}-minute response improvement.`;
        evidence=`${nameOf(r)} response rose to ${oldTime} minutes as monthly contacts reached ${format(contacts)}.`;
        caution='A change in median response multiplied by volume is not actual aggregate wait time or staff time. Preserve accurate answers and regulatory review.';
        break;
      }
      case 'flexport': {
        const base=t[0][2][0], premium=t[0][2][1];
        const cap=Math.min(a,200,Math.floor(150000/650)), gap=Math.max(0,rowNum(base,4)-rowNum(premium,4));
        const prevented=cap*gap/100*b/100;
        const spend=cap*650;
        add('Upgraded shipments',format(cap));
        add('Expected late shipments avoided (assumption)',format(prevented,1));
        add('Upgrade premium spend',dollars(spend));
        add('Spend per modeled late shipment avoided',prevented>0?dollars(spend/prevented):'—');
        summary=`Evaluate ${format(cap)} ocean-standard-to-priority upgrades if a ${format(b)}% share of the historical ${gap}-point reliability gap holds.`;
        evidence=`Ocean standard late rate is ${rowNum(base,4)}%; priority is ${rowNum(premium,4)}%, with a $650 premium/shipment.`;
        caution='Those service groups differ in shipper mix and difficulty, so the observed reliability gap is not a causal upgrade effect.';
        break;
      }
      case 'red-ventures': {
        const spending=rowNum(r,1), qualified=rowNum(r,4), cpa=spending/qualified;
        const leads=a/cpa*b/100;
        add('Historical average cost / qualified lead',dollars(cpa));
        add('Illustrative additional qualified leads',format(leads,1));
        add('Hypothetical marginal cost / lead',dollars(a/Math.max(0.001,leads)));
        summary=`Explore an incremental ${dollars(a)} ${nameOf(r)} experiment using explicit assumptions about marginal lead quality and efficiency.`;
        evidence=`This channel produced ${format(qualified)} qualified leads from ${dollars(spending)} simulated spending; average CPA is ~${dollars(cpa)}.`;
        caution='Average CPA is not marginal CPA. Conversion attribution, repeated exposure and sales quality must be validated using a controlled test.';
        break;
      }
      case 'tepper-sports': {
        const eligible=rowNum(r,1), old=rowNum(r,2), now=rowNum(r,3);
        const unit=rowNum(t[1][2][choice],4), invited=Math.min(a,eligible), renew=invited*b/100;
        add('Accounts invited (assumed opt-in)',format(invited));
        add('Hypothetical incremental renewals',format(renew,1));
        add('Incremental contribution before incentives',dollars(renew*unit));
        add('Renewal change prior to current',format(now-old,1)+' pp');
        summary=`A ${format(invited)}-account pilot in ${nameOf(r)} could test whether flexible benefits improve renewals by ${b} points.`;
        evidence=`Renewal fell from ${old}% to ${now}% among ${format(eligible)} eligible ${nameOf(r)} account holders; contribution per renewal is ${dollars(unit)}.`;
        caution='This excludes pilot and incentive costs; holdout-based incrementality is essential, and invitations require opt-in consent.';
        break;
      }
      case 'charlotte-hornets': {
        const defense = a, availability = b, offense = 100-defense-availability;
        const offA=((58.2/60)+(37.8/40))/2*100, offB=((56.5/60)+(39.4/40))/2*100;
        const avA=(82-18)/82*100, avB=(82-8)/82*100;
        const scoreA=defense*73/100+availability*avA/100+offense*offA/100;
        const scoreB=defense*61/100+availability*avB/100+offense*offB/100;
        add('Assumed offense weight',offense+'%');
        add('Illustrative weighted score: Candidate A',format(scoreA,1));
        add('Illustrative weighted score: Candidate B',format(scoreB,1));
        add('Annual cost difference',dollars(9200000-8600000));
        summary=`Under these subjective weights, candidate ${scoreA>=scoreB?'A':'B'} scores higher. That does not establish a better real-world roster decision.`;
        evidence=`Fictional A: higher matchup difficulty (73 vs 61/100) and $9.2M annual cost; fictional B: fewer missed games (8 vs 18) and $8.6M cost.`;
        caution='All candidates and statistics are fictional. The score uses arbitrary normalizations and omits lineup fit, game tape, medical evaluation, and full uncertainty.';
        break;
      }
    }
    return {metrics,summary,caution,evidence};
  }

  // Preserve the previous detailed case page as an accessible full-brief fallback.
  const originalHero = host.querySelector('.hero');
  const oldCards = Array.from(host.children).filter(node => node !== originalHero);
  const reference = document.createElement('details');
  reference.id = 'ic-reference';
  reference.className = 'ic-reference';
  reference.innerHTML = '<summary>Read the complete original case brief, source tables and definitions <span>↗</span></summary><div class="ic-reference-inner"></div>';
  oldCards.forEach(node => reference.querySelector('.ic-reference-inner').appendChild(node));
  const oldCopy = originalHero?.querySelector('#copy');
  if (originalHero) {
    const note = document.createElement('p');
    note.className = 'ic-hero-note';
    note.textContent = 'INTERACTIVE CASE ROOM · Investigate → test assumptions → defend a decision → build your pitch';
    originalHero.insertBefore(note, originalHero.querySelector('.actions') || null);
  }


  // Optional, stage-specific coaching: guidance without revealing a solution or simulating credentials.
  const coachTrigger = n => `<div class="ic-coach-cta"><button type="button" class="ic-coach-open" data-coach-step="${n}" aria-haspopup="dialog">Get an optional coaching prompt</button><span>Two levels of guidance · No answers given</span></div>`;

  const html = `
    <div class="ic-stage-nav" role="navigation" aria-label="Interactive case stages">
      <a href="#ic-brief">1 · Briefing</a><a href="#ic-data">2 · Data lab</a><a href="#ic-sim">3 · Decision lab</a><a href="#ic-pitch">4 · Pitch builder</a>
    </div>
    <div class="ic-timer-strip"><div><b>Rapid-round practice</b><span>10 minutes to prepare: 0–2 brief, 2–5 evidence, 5–8 decision, 8–10 pitch. Then present for 60–90 seconds.</span></div>
      <div class="ic-timer-controls"><strong id="ic-timer" aria-live="polite">10:00</strong><button type="button" id="ic-timer-toggle">Start</button><button type="button" id="ic-timer-reset">Reset</button></div>
    </div>
    <p id="ic-time-status" class="ic-timer-status" role="status" aria-live="polite">Start when your team is ready. The timer will not submit or lock any response.</p>
    <section class="ic-panel" id="ic-brief" aria-labelledby="ic-brief-title">
      <div class="ic-panel-heading"><div><span class="ic-kicker">STAGE 1 · THE BOARDROOM BRIEFING</span><h2 id="ic-brief-title">What must your team solve?</h2></div><span class="ic-counter">01 / 04</span></div>
      ${coachTrigger(0)}
      <p class="ic-decision">${E(c.decision)}</p>
      <div class="ic-two-col"><div><h3>Stakeholder perspectives</h3>${c.voices.map(v=>`<blockquote class="ic-voice"><b>${E(v[0])}</b><span>“${E(v[1])}”</span></blockquote>`).join('')}</div>
      <div><h3>Constraints you cannot ignore</h3><ul class="ic-list">${c.limits.map(x=>`<li>${E(x)}</li>`).join('')}</ul></div></div>
      <details class="ic-options"><summary>See the decision alternatives</summary><ul class="ic-list">${c.options.map(x=>`<li>${E(x)}</li>`).join('')}</ul></details>
    </section>
    <section class="ic-panel" id="ic-data" aria-labelledby="ic-data-title">
      <div class="ic-panel-heading"><div><span class="ic-kicker">STAGE 2 · EXPLORE THE EVIDENCE</span><h2 id="ic-data-title">Interactive data lab</h2></div><span class="ic-counter">02 / 04</span></div>
      ${coachTrigger(1)}
      <p class="ic-lead">Switch datasets and KPIs to identify a pattern you can defend. Every number below comes from the fictional case exhibits.</p>
      <div class="ic-fields"><label for="ic-exhibit">Exhibit<select id="ic-exhibit"></select></label>
        <label for="ic-metric">Metric to visualize<select id="ic-metric"></select></label>
        <label for="ic-sort">Order<select id="ic-sort"><option value="original">Original</option><option value="desc">Largest first</option><option value="asc">Smallest first</option></select></label></div>
      <div id="ic-chart" class="ic-chart" aria-live="polite"></div>
      <details class="ic-raw"><summary>Open the exact exhibit table</summary><div id="ic-exact-table" class="ic-table-holder"></div></details>
      <p class="ic-fine">These exhibits are descriptive. A difference between groups does not, by itself, prove what caused it.</p>
    </section>
    <section class="ic-panel" id="ic-sim" aria-labelledby="ic-sim-title">
      <div class="ic-panel-heading"><div><span class="ic-kicker">STAGE 3 · PUT A DECISION TO THE TEST</span><h2 id="ic-sim-title">${E(c.co)} decision simulator</h2></div><span class="ic-counter">03 / 04</span></div>
      ${coachTrigger(2)}
      <p class="ic-lead">Choose a scenario and change two assumptions. Discuss whether the resulting option is feasible and what evidence is still missing.</p>
      <div class="ic-sim-grid"><div class="ic-sim-inputs">
        ${model.pick !== null ? `<label class="ic-choice-label" for="ic-choice">${E(model.label)}<select id="ic-choice"></select></label>` : '<p class="ic-weight-note">Scouting exercise: set the weights given to fictional player characteristics.</p>'}
        <label class="ic-range-label" for="ic-a"><span>${E(model.a[0])}</span><output id="ic-a-val"></output></label><input id="ic-a" type="range" min="${model.a[1]}" max="${model.a[2]}" step="${model.a[4]}" value="${model.a[3]}">
        <label class="ic-range-label" for="ic-b"><span>${E(model.b[0])}</span><output id="ic-b-val"></output></label><input id="ic-b" type="range" min="${model.b[1]}" max="${model.b[2]}" step="${model.b[4]}" value="${model.b[3]}">
        <button class="ic-soft-button" id="ic-reset-sim" type="button">Reset assumptions</button>
      </div><div class="ic-sim-result"><p class="ic-badge">ILLUSTRATIVE WHAT-IF · NOT A FORECAST</p><div id="ic-result-metrics" class="ic-results"></div>
        <p id="ic-result-summary" class="ic-result-summary" aria-live="polite"></p><p id="ic-result-caution" class="ic-caution"></p></div></div>
      <details class="ic-method"><summary>See the calculation logic and assumptions</summary><p>${E(model.explain)}</p><p>Slide and data-room constraints still apply. These sensitivity calculations illustrate assumptions; they are not verified employer results.</p></details>
      <div class="ic-panel-challenge"><div><span class="ic-kicker">EXECUTIVE PANEL</span><h3>Defend your decision under pressure</h3><p id="ic-objection" aria-live="polite">Reveal a simulated executive objection after your team decides.</p></div><button type="button" id="ic-reveal">Reveal an objection</button></div>
    </section>
    <section class="ic-panel" id="ic-pitch" aria-labelledby="ic-pitch-title">
      <div class="ic-panel-heading"><div><span class="ic-kicker">STAGE 4 · TURN ANALYSIS INTO A HIRING PITCH</span><h2 id="ic-pitch-title">60–90 second Pitch Builder</h2></div><span class="ic-counter">04 / 04</span></div>
      ${coachTrigger(3)}
      <p class="ic-lead">Write your own evidence-based response. Give an authentic example for <b>Proof of Capability</b>—the tool will not invent your experience.</p>
      <div class="ic-builder-grid">
        <div class="ic-pitch-inputs">
          <label for="ic-field-problem">1 · Business Problem <small>What decision and KPI matter?</small></label><textarea id="ic-field-problem" maxlength="700" rows="3" placeholder="Our employer must decide... The key metric is..."></textarea>
          <label for="ic-field-plan">2 · Analytical Plan <small>What data and method will you use?</small></label><textarea id="ic-field-plan" maxlength="900" rows="3" placeholder="We would compare... Then test..."></textarea>
          <button class="ic-soft-button" id="ic-insert-evidence" type="button">Insert your current data-lab finding</button>
          <label for="ic-field-proof">3 · Proof of Capability <small>Use a REAL project, class, experience, or accomplishment.</small></label><textarea id="ic-field-proof" maxlength="700" rows="3" placeholder="In our MSBA project, we analyzed... and learned..."></textarea>
          <label for="ic-field-value">4 · Business Value <small>What action, outcome, and risk guardrail?</small></label><textarea id="ic-field-value" maxlength="800" rows="3" placeholder="We recommend... Success means... while monitoring..."></textarea>
        </div>
        <div class="ic-pitch-preview"><div class="ic-preview-head"><b>Your pitch outline</b><span id="ic-wordcount">0 words</span></div><div id="ic-preview" class="ic-preview-content" aria-live="polite">Fill in the four fields to build your presentation.</div>
          <div class="ic-export"><button id="ic-copy-pitch" type="button">Copy outline</button><button id="ic-download-pitch" type="button">Save .txt</button></div>
          <p id="ic-pitch-status" class="ic-fine" role="status"></p>
          <div class="ic-submit-panel" aria-label="Team response submission">
            <label class="ic-submit-label" for="ic-team-name">Team or group code <small>No student names, IDs or emails</small></label>
            <input id="ic-team-name" type="text" maxlength="65" autocomplete="off" placeholder="e.g., Group 4 / Team Blue">
            <button type="button" class="ic-submit-button" id="ic-submit-team">Submit team responses</button>
            <p class="ic-submit-status" id="ic-submit-status" role="status">Submit your four completed responses to the instructor dashboard. The Google receipt opens in a new tab when activated.</p>
          </div>
          <p class="ic-fine">Privacy: the online exercise does not transmit or store your answers unless you choose <b>Submit team responses</b>. Save a local copy as a backup. The private instructor dashboard stores submitted group responses and timestamps.</p>
        </div>
      </div>
    </section>
    <dialog class="ic-coach-dialog" id="ic-coach-dialog" aria-labelledby="ic-coach-title" aria-describedby="ic-coach-content">
      <div class="ic-coach-dialog-head"><span class="ic-kicker" id="ic-coach-step-label">OPTIONAL THINKING GUIDE</span><button type="button" id="ic-coach-close" aria-label="Close coaching prompt">×</button></div>
      <h2 id="ic-coach-title">One question to move your thinking forward</h2>
      <p id="ic-coach-content"></p>
      <p class="ic-coach-disclaimer">This is a thinking prompt, not the solution. Use your team's own analysis and actual experience.</p>
      <div class="ic-coach-dialog-actions"><span id="ic-coach-progress">Prompt 1 of 2</span><button type="button" id="ic-coach-next">Show a second nudge</button></div>
    </dialog>
  `;

  const stage = document.createElement('div');
  stage.className = 'ic-app';
  stage.innerHTML = html;
  host.appendChild(stage);
  host.appendChild(reference);

  const coachPrompts = [
    [
      `For ${c.co}, which single business decision needs to be made? State it before naming SQL, Python or another tool.`,
      `Compare the two stakeholder views (${c.voices[0][0]} and ${c.voices[1][0]}). Which constraint rules out a tempting but infeasible idea?`
    ],
    [
      c.questions[0] || `Which group or metric most directly informs the decision for ${c.co}?`,
      `Use both exhibits: "${c.tables[0][0]}" and "${c.tables[1][0]}". Check the denominator, timing and missing context before calling a difference a cause.`
    ],
    [
      c.questions[1] || 'Which assumption most changes your recommendation?',
      `Change one what-if assumption and explain what changes. Can your choice satisfy this guardrail: ${c.limits[0]}? Which result is assumed, not observed?`
    ],
    [
      `As a ${c.role}, what REAL project, practicum or experience proves your team can do the proposed analysis? Do not invent accomplishments.`,
      `Close with one recommendation, a measurable business KPI, a realistic test and a risk guardrail. Check your opening sentence: does it start with the employer's problem?`
    ]
  ];
  const coachLabels=['BRIEFING','DATA LAB','DECISION LAB','PITCH BUILDER'];
  const coachDialog=document.getElementById('ic-coach-dialog');
  let coachStep=0,coachLevel=0,coachLauncher=null;
  const showCoachText=()=>{
    document.getElementById('ic-coach-step-label').textContent=`STAGE ${coachStep+1} · ${coachLabels[coachStep]} · OPTIONAL COACHING`;
    document.getElementById('ic-coach-content').textContent=coachPrompts[coachStep][coachLevel];
    document.getElementById('ic-coach-progress').textContent=`Prompt ${coachLevel+1} of 2`;
    document.getElementById('ic-coach-next').hidden=coachLevel===1;
  };
  stage.querySelectorAll('.ic-coach-open').forEach(btn=>btn.addEventListener('click',()=>{
    coachStep=Number(btn.dataset.coachStep);coachLevel=0;coachLauncher=btn;showCoachText();
    if(coachDialog.showModal)coachDialog.showModal();else coachDialog.setAttribute('open','');
  }));
  document.getElementById('ic-coach-next').addEventListener('click',()=>{coachLevel=1;showCoachText();});
  const closeCoach=()=>{if(coachDialog.close)coachDialog.close();else coachDialog.removeAttribute('open');};
  document.getElementById('ic-coach-close').addEventListener('click',closeCoach);
  coachDialog.addEventListener('close',()=>{if(coachLauncher)coachLauncher.focus();});
  coachDialog.addEventListener('click',e=>{if(e.target===coachDialog)closeCoach();});

  let chartEvidence = '';
  let simEvidence = '';
  let activeObjection = -1;
  const exhibit = document.getElementById('ic-exhibit');
  const metric = document.getElementById('ic-metric');
  const sort = document.getElementById('ic-sort');
  c.tables.forEach((t,i) => exhibit.add(new Option(`Exhibit ${i+1} · ${t[0]}`,String(i))));

  const numericMetricColumns = (table) => {
    if (c.id === 'charlotte-hornets') {
      return table[2].map((r,j)=>({value:j,label:r[0]})).filter(x=> Number.isFinite(num(table[2][x.value]?.[1])) && Number.isFinite(num(table[2][x.value]?.[2])));
    }
    if (c.id === 'pwc' && Number(exhibit.value) === 1) return [];
    return table[1].map((label,j)=>({value:j,label})).filter(x => x.value > 0 && table[2].filter(r=>Number.isFinite(num(r[x.value]))).length >= 2);
  };
  function changeExhibit() {
    metric.innerHTML = '';
    const table=c.tables[Number(exhibit.value)], candidates=numericMetricColumns(table);
    candidates.forEach(v=>metric.add(new Option(v.label,String(v.value))));
    const choice=candidates.find(x=>/current|late|adoption|renew|qualified|rate/i.test(x.label)) || candidates[0];
    if (choice) metric.value=String(choice.value);
    renderChart();
  }
  function renderChart() {
    const table=c.tables[Number(exhibit.value)], holder=document.getElementById('ic-chart'), exact=document.getElementById('ic-exact-table');
    const columns=table[1], rows=table[2];
    exact.innerHTML='<table><thead><tr>'+columns.map(x=>'<th>'+E(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+E(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
    const selected=Number(metric.value);
    if (!metric.options.length || !Number.isFinite(selected)) {
      chartEvidence = `This exhibit describes definitions and process context rather than comparable quantitative categories.`;
      holder.innerHTML='<p class="ic-empty">This exhibit contains definitions that are not directly comparable as a single numerical metric. Open the exact table to analyze what must be standardized.</p>';
      return;
    }
    let values;
    if (c.id === 'charlotte-hornets') {
      const r=rows[selected];
      values=[{label:'Fictional candidate A',text:r[1],n:num(r[1])},{label:'Fictional candidate B',text:r[2],n:num(r[2])}];
    } else {
      values=rows.map(r=>({label:String(r[0]),text:String(r[selected]),n:num(r[selected])})).filter(o=>Number.isFinite(o.n));
    }
    if (sort.value === 'desc') values.sort((a,b)=>b.n-a.n);
    if (sort.value === 'asc') values.sort((a,b)=>a.n-b.n);
    const finite=values.filter(v=>Number.isFinite(v.n));
    const max=Math.max(1,...finite.map(v=>Math.abs(v.n)));
    const hi=finite.reduce((best,v)=>!best || v.n>best.n?v:best,null);
    const lo=finite.reduce((best,v)=>!best || v.n<best.n?v:best,null);
    const name=c.id==='charlotte-hornets'?String(rows[selected]?.[0]||'Selected metric'):String(columns[selected]);
    holder.innerHTML='<div class="ic-chart-head"><b>'+E(name)+'</b><span>'+finite.length+' comparison groups</span></div><div class="ic-bars">'+finite.map((v,i)=>`<div class="ic-bar-row"><div class="ic-bar-label">${E(v.label)}</div><div class="ic-bar-track"><div class="ic-bar-fill ${i%2?'ic-alt':''}" style="width:${Math.max(3,100*Math.abs(v.n)/max).toFixed(2)}%"></div></div><div class="ic-bar-value">${E(v.text)}</div></div>`).join('')+'</div>'+
      (hi&&lo?'<div class="ic-takeaway"><b>Notice:</b> '+E(hi.label)+' is highest ('+E(hi.text)+'); '+E(lo.label)+' is lowest ('+E(lo.text)+'). Check whether denominators and populations are comparable.</div>':'');
    chartEvidence=`In simulated ${table[0]}, ${hi?.label} is highest (${hi?.text}) and ${lo?.label} is lowest (${lo?.text}) for ${name}. The difference is descriptive, not causal.`;
  }
  exhibit.addEventListener('change',changeExhibit);
  metric.addEventListener('change',renderChart);
  sort.addEventListener('change',renderChart);
  changeExhibit();

  const selector=document.getElementById('ic-choice');
  if (selector) {
    allRows(model.pick).forEach((r,i)=>selector.add(new Option(nameOf(r),String(i))));
  }
  const inputA=document.getElementById('ic-a'), inputB=document.getElementById('ic-b');
  const showValue=(v,fmt)=>fmt==='$'?dollars(v):fmt==='pp'?`${format(v,1)} pp`:fmt==='%'?`${format(v)}%`:`${format(v)} ${fmt}`;
  function renderSim() {
    const index=selector?Number(selector.value):0, a=Number(inputA.value), b=Number(inputB.value);
    document.getElementById('ic-a-val').textContent=showValue(a,model.a[5]);
    document.getElementById('ic-b-val').textContent=showValue(b,model.b[5]);
    const outcome=assess(index,a,b);
    document.getElementById('ic-result-metrics').innerHTML=outcome.metrics.map(x=>`<div class="ic-result-card"><span>${E(x.label)}</span><strong>${E(x.value)}</strong></div>`).join('');
    document.getElementById('ic-result-summary').textContent=outcome.summary;
    document.getElementById('ic-result-caution').textContent=outcome.caution;
    simEvidence=outcome.evidence+' '+outcome.summary+' Caveat: '+outcome.caution;
  }
  if(selector) selector.addEventListener('change',renderSim);
  inputA.addEventListener('input',renderSim); inputB.addEventListener('input',renderSim);
  document.getElementById('ic-reset-sim').addEventListener('click',()=>{
    inputA.value=model.a[3];inputB.value=model.b[3];if(selector) selector.value='0';renderSim();
  });
  renderSim();

  const objections=[
    ...c.questions.map(q=>({speaker:'Hiring panel',text:q})),
    ...c.voices.map(v=>({speaker:v[0],text:v[1]}))
  ];
  document.getElementById('ic-reveal').addEventListener('click',()=>{
    activeObjection=(activeObjection+1)%objections.length;
    const o=objections[activeObjection];
    document.getElementById('ic-objection').textContent=`${o.speaker} (fictional): “${o.text}”`;
    document.getElementById('ic-reveal').textContent=activeObjection===objections.length-1?'Review again':'Next objection';
  });

  const ids=['problem','plan','proof','value'];
  const labels=['Business Problem','Analytical Plan','Proof of Capability','Business Value'];
  const fields=ids.map(id=>document.getElementById('ic-field-'+id));
  const initialText=()=>`${c.co} — MSBA Shark Tank Hiring Pitch\nIllustrative role: ${c.role}\n\n`+fields.map((field,i)=>`${labels[i]}:\n${field.value.trim()||'[Your team has not completed this section]'}\n`).join('\n')+'\nClassroom practice only — all case data synthetic.\n';
  function renderPitch() {
    const txt=initialText();
    document.getElementById('ic-preview').textContent=txt;
    const words=fields.map(f=>f.value.trim()).join(' ').trim().split(/\s+/).filter(Boolean).length;
    document.getElementById('ic-wordcount').textContent=`${words} words`;
  }
  fields.forEach(f=>f.addEventListener('input',renderPitch));
  renderPitch();
  document.getElementById('ic-insert-evidence').addEventListener('click',()=>{
    const field=fields[1];
    const snippet='EVIDENCE TO CONSIDER (SIMULATED): '+chartEvidence+' '+simEvidence;
    field.value=(field.value.trim()?field.value.trim()+'\n\n':'')+snippet.slice(0,Math.max(0,900-field.value.length));
    renderPitch();field.focus();
    document.getElementById('ic-pitch-status').textContent='Your current evidence was inserted into Analytical Plan. Edit it into your own language.';
  });
  document.getElementById('ic-copy-pitch').addEventListener('click',async()=>{
    const status=document.getElementById('ic-pitch-status');
    try {await navigator.clipboard.writeText(initialText());status.textContent='Outline copied. You can paste it into your notes.';}
    catch(_){status.textContent='Copy was blocked by your browser. Select the preview text and copy it manually.';}
  });
  document.getElementById('ic-download-pitch').addEventListener('click',()=>{
    const filename='MSBA_Shark_Tank_'+c.id+'_pitch.txt';
    const blob=new Blob([initialText()],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    document.getElementById('ic-pitch-status').textContent='The outline was saved to your device. Nothing was submitted.';
  });

  // Submissions are intentionally disabled until a WFU-owned Apps Script receiver is deployed.
  // No credential or authentication token belongs in this public GitHub Pages site.
  const submitButton=document.getElementById('ic-submit-team');
  const submitStatus=document.getElementById('ic-submit-status');
  const submitTeam=document.getElementById('ic-team-name');
  submitButton.addEventListener('click',()=>{
    const configured=String(window.WFUSB_MSBA_SUBMISSION_ENDPOINT||'').trim();
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/i.test(configured)) {
      submitStatus.textContent='Submission is not activated by your instructor yet. Use Save .txt to keep a copy of your pitch; do not assume it has been submitted.';
      return;
    }
    const team=submitTeam.value.trim();
    if(team.length<2){submitStatus.textContent='Enter a team/group code (at least two characters), without student names or IDs.';submitTeam.focus();return;}
    if(team.length>65){submitStatus.textContent='Group code is too long (maximum 65 characters).';submitTeam.focus();return;}
    if(fields.some(f=>f.value.trim().length<5)){
      submitStatus.textContent='Complete all four response sections (Business Problem, Analytical Plan, Proof of Capability, Business Value) before submitting.';
      const firstEmpty=fields.find(f=>f.value.trim().length<5);firstEmpty?.focus();return;
    }
    // The browser's ordinary form POST opens the receiver's confirmation page in a new tab.
    // The receiver creates a confirmed receipt only AFTER a successful sheet append.
    // This avoids reporting success for an opaque cross-origin fetch response.
    const body={caseId:c.id,team,problem:fields[0].value.trim(),plan:fields[1].value.trim(),proof:fields[2].value.trim(),value:fields[3].value.trim(),timerRemaining:typeof seconds==='number'?seconds:600};
    const form=document.createElement('form');
    form.method='POST';form.action=configured;form.target='_blank';form.style.display='none';
    const payload=document.createElement('input');payload.type='hidden';payload.name='payload';payload.value=JSON.stringify(body);
    form.appendChild(payload);document.body.appendChild(form);form.submit();form.remove();
    submitStatus.textContent='A Google confirmation page should open in a new tab. Your response is not confirmed until you see a receipt with a confirmation number. Keep this page open and use Save .txt as a backup if needed.';
  });

  const TOTAL_SECONDS=600;
  let seconds=TOTAL_SECONDS, timerRunning=false, timerId=null, endsAt=0;
  const timerDisplay=document.getElementById('ic-timer');
  const button=document.getElementById('ic-timer-toggle');
  const timeStatus=document.getElementById('ic-time-status');
  function paintClock(){
    timerDisplay.textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
    timerDisplay.classList.toggle('ic-done',seconds===0);
  }
  function stopClock(){
    if(timerId!==null)clearInterval(timerId);
    timerId=null;timerRunning=false;
    button.textContent=seconds===0?'Restart':'Start';
  }
  function tickClock(){
    if(!timerRunning)return;
    seconds=Math.max(0,Math.ceil((endsAt-Date.now())/1000));
    paintClock();
    if(seconds===0){
      stopClock();timeStatus.textContent='Preparation time is up. Choose your speaker and deliver your 60–90-second pitch; then answer one executive question.';
    }
  }
  button.addEventListener('click',()=>{
    if(timerRunning){tickClock();stopClock();timeStatus.textContent='Timer paused. Resume when your team is ready.';return;}
    if(seconds===0)seconds=TOTAL_SECONDS;
    endsAt=Date.now()+seconds*1000;
    timerRunning=true;button.textContent='Pause';
    timeStatus.textContent='Countdown running · you can pause or reset it. Coaching prompts are optional.';
    tickClock();
    timerId=setInterval(tickClock,250);
  });
  document.addEventListener('visibilitychange',tickClock);
  document.getElementById('ic-timer-reset').addEventListener('click',()=>{
    stopClock();seconds=TOTAL_SECONDS;paintClock();button.textContent='Start';
    timeStatus.textContent='10-minute preparation reset. Start when your team is ready.';
  });
  paintClock();
  document.documentElement.classList.add('ic-enabled');
})();