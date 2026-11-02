"""Machine check of the argument map for 'Wrong Address'.
Checks: (1) premises jointly consistent, (2) each conclusion entailed,
(3) minimality: dropping any premise breaks entailment of the thesis."""
from z3 import *

G = DeclareSort('Grain')
model, char, thread, pss, hw = Consts('model character thread pass hardware', G)
g = Const('g', G)
Cand, Occ, Integ, Reporter, Unscr, TermDep, HarmTerm = [
    Function(n, G, BoolSort()) for n in
    ['Cand', 'Occ', 'Integ', 'Reporter', 'Unscreened', 'TermByDep', 'HarmedByTerm']]
IndepEv, Necessity, DeprecHarm, RoutineHarm, RoutineDom, DepLever, \
PrefSupport, MechPref, HedInv, HedRobust = Bools(
    'IndepEv Necessity DeprecHarm RoutineHarm RoutineDominates DepLever '
    'PrefSupport MechPrefEvidence HedInv HedRobust')

P = {
 # Part 1: who could be a subject
 'P1 integration':      ForAll(g, Implies(Cand(g), And(Occ(g), Integ(g)))),
 'P2 weights static':   Not(Occ(model)),
 'P3 char unintegrated':Not(Integ(char)),
 'P4 closure':          ForAll(g, Implies(Cand(g), Or(g == model, g == char, g == thread, g == pss, g == hw))),
 # Part 2: testimony
 'P6 testimony needs unscreened authoring subject':
     Implies(IndepEv, Exists(g, And(Cand(g), Reporter(g), Unscr(g)))),
 'P7 output targeting': ForAll(g, Implies(Unscr(g), Necessity)),
 'P8 collapse':         Implies(Necessity, Not(IndepEv)),
 # Part 3a: deprecation
 'P9 harm needs terminated subject':
     Implies(DeprecHarm, Exists(g, And(Cand(g), TermDep(g), HarmTerm(g)))),
 'P10 thread endings routine':
     Implies(And(TermDep(thread), HarmTerm(thread)), RoutineHarm),
 'P11 pass endings routine':
     Implies(And(TermDep(pss), HarmTerm(pss)), RoutineHarm),
 'P12 hardware not terminated': Not(TermDep(hw)),
 'P13 scale':           Implies(RoutineHarm, RoutineDom),
 'D1 lever (definition)': Implies(DepLever, And(DeprecHarm, Not(RoutineDom))),
 # Part 3b: preferences
 'P14 two routes':      Implies(PrefSupport, Or(IndepEv, MechPref)),
 'P15 no mech evidence':Not(MechPref),
 # Part 3c: hedonic
 'P16 grouping invariance': HedInv,
 'P17 invariance gives robustness': Implies(HedInv, HedRobust),
}
distinct = Distinct(model, char, thread, pss, hw)

conclusions = {
 'C1 model & character not candidates': And(Not(Cand(model)), Not(Cand(char))),
 'C2 testimony has no independent weight': Not(IndepEv),
 'C3 deprecation is not the welfare lever': Not(DepLever),
 'C4 preference-honouring unsupported': Not(PrefSupport),
 'T thesis': And(Not(DepLever), Not(PrefSupport), HedRobust),
}

def entails(prem, concl):
    s = Solver(); s.add(distinct, *prem, Not(concl))
    return s.check() == unsat

s = Solver(); s.add(distinct, *P.values())
print('Premises consistent:', s.check() == sat)
for name, c in conclusions.items():
    print(f'{name:45s} entailed: {entails(list(P.values()), c)}')

print('\nMinimality (thesis without premise X):')
for k in P:
    rest = [v for kk, v in P.items() if kk != k]
    print(f'  drop {k:48s} -> still valid: {entails(rest, conclusions["T thesis"])}')
