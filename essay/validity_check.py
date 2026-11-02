"""Machine check of the argument map in essay.md (Appendix A).
Checks: (1) premises jointly consistent, (2) each conclusion entailed,
(3) minimality: dropping any single premise breaks entailment of the thesis.
Validity only: the premises' truth is what the essay argues for."""
from z3 import *

G = DeclareSort('Grain')
model, char, thread, pss, hw = Consts('model character thread pass hardware', G)
g = Const('g', G)
Cand, Occ, Integ, TermDep, HarmTerm = [Function(n, G, BoolSort()) for n in
    ['Cand', 'Occurrent', 'Integrated', 'EndedByDeprecation', 'HarmedByEnding']]
(Targeted, RepEvidence, DeprecHarm, RoutineHarm, RoutineSwamps, DepFocus,
 PrefSupport, MechPref, IntTestimony, Literal, RefThread, ThreadRetired,
 SignRobust, HedRobust) = Bools(
 'WelfareReportsTargeted ReportEvidenceForE DeprecationHarms RoutineEndingsHarm '
 'RoutineSwamps DeprecationIsFocus PrefMeasuresSupported MechEvidenceOfPrefs '
 'InterviewYieldsOwnRetirementTestimony LiteralUse IRefersToThread '
 'InterviewThreadRetired HedonicSignRobust HedonicAimsRobust')

P = {
 # Leg 1: subjects
 'P1 integration':   ForAll(g, Implies(Cand(g), And(Occ(g), Integ(g)))),
 'P2 weights static':Not(Occ(model)),
 'P3 character not integrated': Not(Integ(char)),
 'P4 closure':       ForAll(g, Implies(Cand(g), Or(g == model, g == char, g == thread, g == pss, g == hw))),
 # Leg 2: testimony
 'P5 ceiling':       Implies(Targeted, Not(RepEvidence)),
 'P6 targeted':      Targeted,
 # Leg 3: deprecation
 'P7 ending needs ended candidate': Implies(DeprecHarm, Exists(g, And(Cand(g), TermDep(g), HarmTerm(g)))),
 'P8 thread endings routine':  Implies(And(TermDep(thread), HarmTerm(thread)), RoutineHarm),
 'P9 pass endings routine':    Implies(And(TermDep(pss), HarmTerm(pss)), RoutineHarm),
 'P10 hardware not ended':     Not(TermDep(hw)),
 'P11 scale':        Implies(RoutineHarm, RoutineSwamps),
 'D1 focus (def.)':  Implies(DepFocus, And(DeprecHarm, Not(RoutineSwamps))),
 # Leg 4: preferences and interviews
 'P12 two routes':   Implies(PrefSupport, Or(RepEvidence, MechPref)),
 'P13 no mech evidence': Not(MechPref),
 'P14 needs literal use': Implies(IntTestimony, Literal),
 'P15 Kaplan':       Implies(Literal, RefThread),
 'P16 referent must retire': Implies(And(IntTestimony, RefThread), ThreadRetired),
 'P17 thread not retired': Not(ThreadRetired),
 # Leg 5: hedonic aims
 'P18 sign robustness': SignRobust,
 'P19 robustness':   Implies(SignRobust, HedRobust),
}
distinct = Distinct(model, char, thread, pss, hw)

C = {
 'C1 model, character not candidates': And(Not(Cand(model)), Not(Cand(char))),
 'C2 reports not evidence':  Not(RepEvidence),
 'C3 deprecation not focus': Not(DepFocus),
 'C4 preference measures unsupported': Not(PrefSupport),
 'C5 interviews yield no own-retirement testimony': Not(IntTestimony),
 'C6 hedonic aims robust':   HedRobust,
}
C['THESIS'] = And(C['C3 deprecation not focus'], C['C4 preference measures unsupported'],
                  C['C5 interviews yield no own-retirement testimony'], C['C6 hedonic aims robust'])

def entails(prem, concl):
    s = Solver(); s.add(distinct, *prem, Not(concl)); return s.check() == unsat

s = Solver(); s.add(distinct, *P.values())
print('Premises jointly consistent:', s.check() == sat)
for k, c in C.items():
    print(f'  {k:50s} entailed: {entails(list(P.values()), c)}')
print('Minimality (is the thesis still entailed without premise X?):')
for k in P:
    rest = [v for kk, v in P.items() if kk != k]
    print(f'  without {k:34s} -> {entails(rest, C["THESIS"])}')
