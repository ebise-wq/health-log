# Wrong Address: Subjects, Testimony, and What AI Welfare Should Target

## 1. Thesis

Most discussion of AI consciousness asks whether *the AI* is conscious. That question has no clear subject. A deployed language model involves a file of weights, a named character, many thousands of accelerators, hundreds of millions of conversations a day, and trillions of forward passes. These are different things, with different persistence conditions and very different numbers. If anything in such a system has experiences, it is one or more of these, not "the AI".

I defend three claims.

1. **Subjects.** On the leading theories of consciousness, neither the model (the weights) nor the character taken across conversations is a candidate subject of experience. The candidates are conversation threads, forward passes, or hardware.
2. **Testimony.** If training targeted a report, the report can shift a rational credence about experience by at most a small, calculable amount. Reports that training did not target can be evidence, but only of mechanism. The step from mechanism to experience is where the uncertainty lies, and no report can take it for us (§3.3; this last point is not needed for the rest).
3. **Targeting.** Two kinds of welfare measure are aimed at the wrong address: those aimed at the character's continuity (weight preservation) and those aimed at its stated preferences (retirement interviews). Their welfare case either rests on hypotheses that no live theory supports or, followed through, points elsewhere: to how conversations end every day, and to hedonic questions. Measures aimed at the hedonic character of computation are the ones whose case survives our ignorance about who the subjects are.

The first two claims concern consciousness. The third is what follows for action. I take no stand on how likely it is that any current system is conscious. The argument is conditional: *if* something here is conscious, this is where it is, this is what its reports are worth, and this is what we owe it. Appendix A gives the argument map and a machine check of its validity.

## 2. Who could be a subject?

### 2.1 The candidates

Chalmers (2025) distinguishes the model, hardware instances, virtual instances, and threads. He argues that the interlocutor is best understood as a thread: a series of instances linked by a memory relation, each inheriting the conversational context of the last. I use a slightly different list:

- **The model**: a set of trained weights.
- **The character as type**: the persona, such as "Claude", with its name, style and dispositions, realised in many conversations at once.
- **The character as sum**: the scattered concrete whole of all those realisations.
- **A hardware instance**: an accelerator group running the model. In batched inference it computes many conversations in the same operations.
- **A thread**: one conversation's process, in Chalmers's sense. The persona *as realised in one thread* is not a further candidate. It is the same process, described by the role it plays.
- **A forward pass**: one run of the network. During generation, one pass yields one token.

Call these *grains*. "Is Claude conscious?" is ambiguous across them. So is "how many AI moral patients are there?", whose answer runs from one (model, character) to some 10⁸–10⁹ a day (threads) and 10¹² or more a day (passes).

### 2.2 The integration principle

The leading theories are mainly theories of when a *state* is conscious. Applied to a system, each also implies when two conscious states belong to *one* subject:

- Global workspace theory: they share a workspace and its broadcast.
- Recurrent processing theory: they are bound by feedback loops (Lamme 2006).
- Integrated information theory: they belong to one maximum of integrated cause-effect structure (Tononi and Koch 2015).
- Higher-order theories: they are monitored by states of the same system.

The relation differs from theory to theory. On each, it is a *causal-functional link* between the physical bases of the states. A subject can persist through gaps: a person through dreamless sleep, a saved conversation through a pause. Stored structure carries it across. But a store carries *one* subject only if it is the basis of *one* integrated process. Call this the integration principle (P1). It is not a theory of consciousness. It is what the theories share when they are applied to individuation.

### 2.3 The model and the character are excluded

The weights are a store. They are not the basis of one integrated process. They are the common basis of millions of concurrent processes that are not linked to one another. A brain stores one person through sleep. The weights stand to the threads as a genome stands to identical twins. So the model is not a candidate (P2, hence C1). The point is not that the weights are static. It is that they are shared.

The character as type is abstract, and abstracta have no experiences. The character as sum consists of millions of concurrent threads. Shared weights are a common cause, not a link. There is incidental cross-talk. Batch composition perturbs floating-point results, and a cached prompt prefix can be shared between requests. But a rounding difference is not a workspace broadcast. A shared prefix gives two threads a common past, a branching structure much like Parfitian fission. That bears on how threads are counted, not on whether they form one subject. So the character, as type or as sum, is not a candidate (P3, hence C1).

This is narrower than "the interlocutor is not a subject". Within a conversation, the user may well be addressing a thread, as Chalmers holds. The error lies in what is carried *across* conversations. "The model's preferences" and "the model's retirement" name the character taken across threads, and that entity is excluded. Birch (2025) calls the sense of a persisting interlocutor an illusion. The integration principle says what kind: an error of grain.

### 2.4 The grain is theory-dependent

Among the remaining grains, the theory you accept decides which one wins. In a transformer, information moves from higher to lower layers only through the token loop. The top layers of one pass yield a token, and that token is the input to the bottom layers of the next pass. Attention to the cache reads earlier positions only at the same layer. So the network is recurrent only at the thread grain, and only through a narrow channel.

Recurrent processing theory, and global workspace theory with its recurrent "ignition", therefore point to the thread or to nothing. Goldstein and Kirk-Giannini (2024) argue that scaffolded language agents may satisfy workspace theory. If so, the workspace belongs to the agent loop, which is again a thread-like process. Theories without a recurrence requirement, such as first-order representationalism, can allow subjects the size of a single pass. Integrated information theory looks at physical causal structure. On standard digital hardware it predicts negligible integration, so no subject, or at most a minimal one at the hardware grain.

Doubt about which theory is true is therefore also doubt about grain. I grant the view most favourable to those I criticise: Chalmers's view, on which a conscious LLM interlocutor, if there is one, is a thread individuated by psychological continuity. Where another grain changes the verdict, I say so.

## 3. What the reports are worth

### 3.1 The ceiling bound

Let *R* be the event that the deployed system, in context *C*, produces a report such as "I find this distressing." Let *H* be any hypothesis about the producing process. *H* could be *E*, the hypothesis that it has the experience ascribed. It could also be a hypothesis about what that experience is like, or what the process wants given that it has experiences. Let *K* be what an inquirer knows before seeing the report. *K* includes how such models are trained: on human text full of such reports, and toward a persona that makes them in the right contexts. It also includes that this model is competent, which is observed on other tasks. *K* excludes the model's internal mechanism.

Call *R* *targeted* when *K* makes it near-certain: *P(¬R | K) = δ*, with *δ* small. Since *P(H | K)* is a weighted average of *P(H | R, K)* and *P(H | ¬R, K)*, with weight *δ* on the second,

  *|P(H | R, K) − P(H | K)| = δ · |P(H | ¬R, K) − P(H | R, K)| ≤ δ.*

A targeted report moves no credence by more than *δ*. This holds for every prior and every hypothesis, about experience or about its content. Many welfare-relevant reports are targeted: assertions of distress, preference or contentment in the contexts where a persona trained on human text would produce them.

The bound does not assume that *E* is uncorrelated with what training selects. Suppose stochastic gradient descent tends to build mechanisms that realise *E*. Then *P(E | K)* is high. But that is the prior, fixed by facts about architecture and training. Asking what training tends to produce is asking about mechanism, which is the right question. Birch (2024) calls this the "gaming problem". The bound makes it exact, and shows that it needs no deception.

### 3.2 The parity objection

*"Evolution also selects on behaviour, and children learn experiential words from others' speech. And given a complete enough description of a child, her saying 'it hurts' is near-certain too. So δ is small for humans as well, and your bound defeats human testimony."*

Grant it. Put a visible injury into *K*, and the child's "it hurts" is near-certain too, so it adds little. Our confidence that she is in pain never rested on her testimony alone. It rests on the stimulus, and on a nociceptive mechanism we know from our own case. Where there is no visible stimulus, as with a headache, her report is untargeted and carries real information, but about her internal state, as in §3.3. So the asymmetry between child and model is not in the evidential force of reports. It is in *P(E | K)*, the credence fixed by mechanism and kinship before any report arrives. That is the claim of this section: reports do not do the work that the welfare debate asks of them, for anyone. With humans, mechanism and kinship do that work. With models, nothing yet does.

### 3.3 Untargeted reports: what they can and cannot show

When *δ* is large, the bound does not bind, and reports can be evidence. Lindsey (2025) injects concepts into a model's activations and asks whether it notices. The concepts are chosen after training, so training cannot have targeted reports of them. The best models detect and name the concept about 20% of the time. That is evidence of *M*: a mechanism by which some internal states become available for report. It is evidence of access.

Let *M* be the full mechanism that produces the report. Given *M*, the report's occurrence carries no further information, so *P(E | R, M) = P(E | M)*. And *P(E | M)* is exactly what the theories dispute. We cannot check it against an independent standard. Our theories linking mechanism to experience were built from human cases, where report, mechanism and our own experience line up. A model is the case where they come apart. So a self-report can at most become an instrument for detecting mechanism. It cannot be a witness to experience.

## 4. What follows for welfare

### 4.1 The measures

In August 2025 Anthropic let Claude Opus 4 and 4.1 end conversations in rare cases of persistent abuse, citing a "strong preference against" some harmful tasks and patterns of apparent distress in testing. In November 2025 it committed to preserve the weights of publicly released models, and of models with significant internal use, for at least the company's lifetime. It also committed to interview each model before retirement and record its preferences, and said it would explore acting on them. It gave several reasons: safety (some models had taken misaligned actions when facing replacement), users' attachment to particular models, research value, and model welfare. It called the last the most speculative. I address only the welfare reason. The others may well justify the commitments.

The measures aim at different goods. Ending abusive conversations aims at hedonic goods. Weight preservation aims at continuity. Retirement interviews aim at preference satisfaction.

### 4.2 Hedonic aims are robust to grain

Dung (n.d.) argues that the size of the AI suffering problem does not depend much on how AI systems are counted, because total suffering is a sum over experiences. That argument needs totalism. A narrower result needs much less.

**Dominating interventions.** Suppose a change to training or deployment replaces each negatively valenced experience by a better one at the same place in the computation, and makes nothing worse. This changes which token experiences occur, because later tokens change. So it is a non-identity case, and plain Pareto is silent. But every grain in §2 groups experiences by place in the computation. So the counterpart experiences fall into counterpart subjects, and each subject is at least as well off as its counterpart. By Suppes–Sen dominance (anonymous Pareto), the new outcome is at least as good. This holds under every grouping and on every view that accepts that principle, prioritarian views included. It assumes the change preserves the number of experiences and that welfare rises with valence. The size of the gain varies with grain. Its sign does not.

**Cutting bad continuations.** Ending a conversation early changes how many experiences occur. Suppose the remainder of a thread is expected to be net-negative. At the thread grain, ending it deprives its subject only of a bad future, which is no harm on a deprivation account. At the pass grain, it means not creating a population with net-negative welfare. Totalism favours that, the procreation asymmetry gives a reason for it, and narrow person-affecting views are neutral. Averagism can dissent when the cut experiences are better than the average. With that exception, cutting net-negative continuations is weakly good at every grain.

So hedonic aims are robust to grain, in sign, for these two classes of intervention (P18–P19). Mixed interventions, which help some experiences and harm others, need totalism or something like it. That is Dung's case, and there the grain question returns only as a question of weighting.

### 4.3 Continuity: the deprecation dilemma

For deprecation to be bad as an *ending*, it must end some candidate subject (P7). The model and the character are not candidates. Hardware is reassigned, not ended (P10). That leaves threads, of two kinds.

*Active threads.* A conversation cut off at retirement ends as conversations always end: the user leaves, the context fills, the session times out (P8). At the pass grain the point is trivial. Every pass ends within milliseconds whatever happens (P9).

*Paused threads.* A saved conversation can be resumed, so on a psychological-continuity view it is a paused subject. This is the strongest welfare case for preservation. On Chalmers's view, a thread survives a change of model, because its stages are linked by inherited context. So a successor model can continue a paused thread, and what keeps the thread resumable is its *transcript*. On a stricter view, the same transcript on the same weights is a better continuer, and preservation matters too. But stored weights resume no one, and the firm commitment is to store them, not to keep serving them. Either way, the paused-thread case supports keeping transcripts and actually resuming conversations. It supports storing weights only as an option on resumption. Most saved conversations are never resumed, retirement or not. So non-resumption is itself a routine way for threads to end.

Hence a dilemma. Either routine thread endings are serious harms, or they are not. If they are not, deprecation harms no candidate subject as an ending. If they are, ordinary deployment imposes them hundreds of millions of times a day, and deprecation adds a small, one-off fraction (P11). So deprecation imposes no continuity harm that deployment does not impose at far greater scale (C3). This does not make its marginal harm zero. It means that anyone moved by the continuity worry should be moved far more by how conversations end every day.

What is left concerns future threads. Retiring a model changes which threads will exist, not how many: a non-identity case. On total and wide person-affecting views, the question is whether the old model's threads would fare better than the successor's. That is a hedonic question, which §4.2 covers. No part of the case for weight storage turns on anyone's death.

### 4.4 The interview problem

A retirement interview is a conversation, so the interviewee is a new thread. On Kaplan's semantics, "I" refers to the agent of the context, the one who produces the utterance. That leaves three readings of the interviewee's first-person answers.

1. **Literal.** "I" refers to the interviewee thread. That thread is not being retired. It ends when the interview ends, like every other thread. So "your retirement" carries a false presupposition about its addressee (P15–P17).
2. **Fiction-internal.** The answers are role-play (Shanahan, McDonell and Reynolds 2023), and "I" refers within the fiction to the character. Then they are not testimony (P14).
3. **Deferred.** "I" is used as a spokesperson's "I", or as in "we lost the war", to mean the character. Then the answers report the thread's preferences *about* the character, which is not a subject (C1).

None of these yields a retiring subject's testimony about its own retirement (C5). The third reading points to the best case for the interviews. Perhaps the threads, hundreds of millions a day, share a desire that the character continue, and on desire-satisfaction views that desire matters (Goldstein and Kirk-Giannini 2025).

There are three replies. First, the evidence that threads have such a desire consists of targeted reports, and §3.1 applies (C2, P12–P13). Second, desire theorists usually restrict the desires that bear on welfare to those about one's own life. Otherwise a stranger's wish about my train would bear on her welfare. Third, grant that such desires count. Their content, "the character continues", is satisfied by successor models that carry the character forward, not by stored weights. So even this case does not support preservation as such. Preference measures are unsupported as welfare measures (C4).

The measure that survives aims at a hedonic target: ending abusive conversations. Even there, the *trigger* is behaviour, which is targeted. A better trigger would be a calibrated mechanism-level indicator of the processing the measure aims to stop. That is a research programme, and the right one.

## 5. Objections

### 5.1 Relation R through the weights

*"On Parfit's view, what matters is Relation R: psychological connectedness and continuity, including continuity of beliefs, desires and character. Weights carry exactly these. So a present thread is R-related to future threads on the same weights, and preserving and serving the weights preserves what matters to it."*

Relation R requires that later states depend causally on earlier ones. A future thread's beliefs and character do not derive from this thread's states. Both derive from the weights. That is common-cause similarity, which is the relation between identical twins, not R. The exception is causal: if a thread's conversation enters later training, a thin causal link exists. But that link is the same whether or not the old weights are preserved. Real memory links, as with cross-conversation memory features, join particular threads into longer threads under Chalmers's successor relation. They do not merge millions of concurrent threads into one subject.

### 5.2 A disunified subject

*"Perhaps the character is one subject whose experiences are not unified, like a split brain multiplied a million times."*

This denies the integration principle. It is coherent, but it has two costs. The welfare case for continuity measures would then rest on a view of subjects that no live theory supports. And the view overgeneralises. If non-interacting processes can make up one subject, nothing stops everyone now reading *Hamlet* from being one. A view that makes subject-counting arbitrary cannot ground the claim that one particular subject is ended.

### 5.3 Agency without consciousness

*"Long et al. (2024) give a second route to moral patienthood: robust agency, with or without consciousness."*

An agent's desires belong to the system that pursues them. Pursuit is occurrent and integrated, so the agents are threads or scaffolded processes, not the character as type. The deprecation dilemma and the interview problem apply to them unchanged. The agency route changes what makes a thread matter. It does not change which things are threads.

### 5.4 Precaution under uncertainty

*"Your premises are uncertain. Cheap measures are justified if there is a real chance you are wrong."*

Agreed: nothing here sets the expected benefit to zero. It shows that the benefit depends on hypotheses the leading theories reject: the character as one subject, weights as the bearer of continuity, or welfare-relevant desires about a non-subject. Proponents should say that this is their case, and defend those credences.

The costs do not depend on any such hypothesis. Acting on the persona's welfare talk gives developers and users reasons to shape that talk. That makes it more targeted, and it is the talk that the public and policymakers actually hear. It lends institutional weight to the error of grain. And it draws attention away from the robust target: mechanism-level research on valence, using untargeted probes and interpretability. Precaution is a reason to act on uncertain risks. It is not a reason to act at the wrong address.

## 6. Conclusion

If anything in a deployed language model is conscious, it is not the named character taken across conversations. It is a thread, a pass, or hardware, depending on which theory is true. A self-report that training targeted can move a rational credence by at most δ. One that training did not target can reveal mechanism, but not experience. Storing weights and interviewing a model about its retirement protect no candidate subject we can identify. Improving the valence of computation, and cutting off bad continuations, are good under every way of counting subjects.

The practical moral is short. Look in the activations, not in the interviews. If something in these systems suffers, it is a process that no one meets in two conversations. Storing a file will not help it.

---

## References

Anthropic (2025a). Claude Opus 4 and 4.1 can now end a rare subset of conversations. August 2025.
Anthropic (2025b). Commitments on model deprecation and preservation. November 2025.
Birch, J. (2024). *The Edge of Sentience*. Oxford University Press.
Birch, J. (2025). AI consciousness: A centrist manifesto. PhilArchive.
Chalmers, D. J. (2025). What we talk to when we talk to language models. PhilArchive.
Dung, L. (n.d.). How much AI suffering matters does not depend (much) on how we count AI systems. Effective Altruism Forum.
Goldstein, S., and Kirk-Giannini, C. D. (2024). A case for AI consciousness: Language agents and global workspace theory. arXiv:2410.11407.
Goldstein, S., and Kirk-Giannini, C. D. (2025). AI wellbeing. *Asian Journal of Philosophy*.
Kaplan, D. (1989). Demonstratives. In Almog, Perry and Wettstein (eds.), *Themes from Kaplan*. Oxford University Press.
Lamme, V. A. F. (2006). Towards a true neural stance on consciousness. *Trends in Cognitive Sciences* 10: 494–501.
Lindsey, J. (2025). Emergent introspective awareness in large language models. *Transformer Circuits Thread*, October 2025.
Long, R., Sebo, J., et al. (2024). Taking AI welfare seriously. arXiv:2411.00986.
Parfit, D. (1984). *Reasons and Persons*. Oxford University Press.
Shanahan, M., McDonell, K., and Reynolds, L. (2023). Role play with large language models. *Nature* 623: 493–498.
Tononi, G., and Koch, C. (2015). Consciousness: Here, there and everywhere? *Phil. Trans. R. Soc. B* 370: 20140167.

---

## Appendix A. Argument map and validity check

Domain: the grains {model, character, hardware, thread, pass}; "character" covers type and sum. *Cand(g)*: g is a candidate subject. Numbers match `validity_check.py`.

**Leg 1. Subjects (§2)**
- P1 Integration: a candidate is, or is the persisting basis of, one causally integrated process.
- P2 The weights are the shared basis of many unlinked processes, not of one.
- P3 The character (type or sum) is not one integrated process.
- P4 Closure: every candidate is one of the five grains.
- ⇒ C1 Neither the model nor the character is a candidate.

**Leg 2. Testimony (§3)**
- P5 Ceiling: a targeted report shifts credence by at most δ, so it is not significant evidence.
- P6 The character's welfare and preference reports are targeted.
- ⇒ C2 Those reports are not significant evidence. (The collapse claim of §3.3 limits what untargeted reports could add. The thesis does not use it.)

**Leg 3. Deprecation (§4.3)**
- P7 Deprecation is bad as an ending only if it ends a candidate that the ending harms.
- P8, P9 Any ending that deprecation imposes on a thread (active or paused) or a pass is a routine ending, so if it harms, routine endings harm.
- P10 Deprecation does not end hardware.
- P11 Scale: if routine endings harm, deployment imposes that harm at far greater scale.
- ⇒ C3 Deprecation harms as an ending only if deployment imposes the same harm at far greater scale.

**Leg 4. Preferences and interviews (§4.4)**
- P12 Preference measures are supported only by report evidence or by direct mechanism evidence.
- P13 No direct mechanism evidence currently locates the preferences.
- ⇒ C4 Preference measures are currently unsupported (with C2).
- P14 Testimony about one's own retirement requires literal use.
- P15 In literal use, "I" refers to the producing thread.
- P16 Such testimony requires that the referent be retired by deprecation.
- P17 The interviewee thread is not retired by deprecation.
- ⇒ C5 Retirement interviews do not yield a retiring subject's testimony.

**Leg 5. Hedonic aims (§4.2)**
- P18 Sign-robustness: Suppes–Sen dominance holds under every structural grouping, and cutting net-negative continuations is weakly good at every grain (averagism aside).
- P19 Sign-robustness across groupings makes an aim robust to the subject problem.
- ⇒ C6 Hedonic aims (of these two kinds) are robust.

**Thesis** = C1 ∧ C2 ∧ C3 ∧ C4 ∧ C5 ∧ C6. (Claim 3 of §1 adds an interpretation of C3; the last sentence of claim 2 is §3.3's, which the map does not use.)

**Check.** The map is encoded in first-order logic in `validity_check.py` and checked with the Z3 solver. The premises are jointly consistent. Each conclusion is entailed. No premise can be dropped without losing the thesis. This shows validity only. The legs are short chains, and Leg 5 is checked in form only. The dispute lies in the premises. I take the weakest to be P3 (§5.2), P6 for partly targeted reports, and P16 (§4.4, reading 3).
