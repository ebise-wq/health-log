# Wrong Address: Subjects, Testimony, and What AI Welfare Should Target

## 1. Thesis

Most discussion of AI consciousness asks whether *the AI* is conscious. That question has no clear subject. A deployed language model involves a file of weights, a named character, many thousands of accelerators, hundreds of millions of conversations, and trillions of forward passes. These are different things, with different persistence conditions and very different numbers. If anything in such a system has experiences, it is one or more of them, not "the AI".

I defend three claims.

1. **Subjects.** On the leading theories of consciousness, neither the model (the weights) nor the character taken across conversations is a candidate subject of experience. The candidates are conversation threads, forward passes, or hardware.
2. **Testimony.** A report that training targeted has a likelihood ratio bounded close to 1 for the experience it ascribes. Reports that training did not target can be evidence, but only of mechanism. The step from mechanism to experience is where all the uncertainty lies, and no report can take it for us.
3. **Targeting.** Welfare measures aimed at the character's continuity (weight preservation) and at its stated preferences (retirement interviews) are aimed at the wrong address. Their welfare case depends on hypotheses that no live theory supports. Measures aimed at the hedonic character of computation are the ones whose case survives our ignorance about who the subjects are.

The first two claims concern consciousness. The third is what follows for action. I take no stand on how likely it is that any current system is conscious. The argument is conditional: *if* something here is conscious, this is where it is, this is what its reports are worth, and this is what we owe it. Appendix A gives the argument map and a machine check of its validity.

## 2. Who could be a subject?

### 2.1 The candidates

Chalmers (2025) distinguishes the model, hardware instances, virtual instances, and threads. He argues that the interlocutor is best understood as a thread: a series of instances linked by a memory relation, each inheriting the conversational context of the last. I use a slightly different list:

- **The model**: a set of trained weights.
- **The character as type**: the persona, such as "Claude", with its name, style and dispositions, realised in many conversations at once.
- **The character as sum**: the scattered concrete whole of all those realisations.
- **A hardware instance**: an accelerator group running the model. In batched inference it computes many conversations in the same operations.
- **A thread**: one conversation's process, from first token to last, in Chalmers's sense. The persona *as realised in one thread* is not a further candidate. It is the same process, described by the role it plays.
- **A forward pass**: one run of the network. During generation, one pass yields one token.

Call these *grains*. "Is Claude conscious?" is ambiguous across them, and so is "how many AI moral patients are there?" The answer runs from one (model, character) to around 10⁹ a day (threads) and 10¹² or more a day (passes).

### 2.2 The integration principle

The leading theories are mainly theories of when a *state* is conscious. Applied to a system, each also implies when two conscious states belong to *one* subject. Global workspace theory says this happens when the states share a workspace and its broadcast. Recurrent processing theory says it happens when they are bound by feedback loops (Lamme 2006). Integrated information theory says it happens when they belong to one maximum of integrated cause-effect structure (Tononi and Koch 2015). Higher-order theories say it happens when they are monitored by states of the same system. The relation differs from theory to theory. But on each theory it is a *causal-functional link* between the physical bases of the states. And each locates subjects in *occurrent processes*, not in stored structures.

Call this the integration principle (P1 in the map). It is not a theory of consciousness. It is what the theories share.

### 2.3 The model and the character are excluded

The weights are a parameter set stored on disk and loaded into memory. They are the dispositional basis of every process that runs the model, much as a genome is the dispositional basis of an organism. No live theory assigns experience to a stored structure. So the model is not a candidate (P2).

The character as type is abstract, and abstracta do not have experiences. The character as sum consists of millions of threads running at once on different machines. These threads are not linked in any way the theories care about. They share weights, but shared weights are a common cause, not a link. There is incidental cross-talk. Batch composition perturbs floating-point results, and a cached prompt prefix can be shared between requests. But a rounding difference is not a workspace broadcast. A shared prefix gives two threads a common past, a branching structure much like Parfitian fission. That bears on how threads are counted, not on whether all of them make up one subject. So the character, as type or as sum, is not a candidate (P3).

This is narrower than "the interlocutor is not a subject". Within a conversation, the user may well be addressing a thread, as Chalmers holds. The error lies in what is carried *across* conversations. The entity that welfare discussions name when they speak of "the model's preferences" or "the model's retirement" is the character taken across threads. That entity is excluded. Birch (2025) calls the sense of a persisting interlocutor an illusion. The integration principle says what kind of illusion it is: an error of grain.

### 2.4 The grain is theory-dependent

Among the remaining grains, the theory you accept decides which one wins.

In a transformer, information moves from higher to lower layers only through the token loop. The top layers of one pass yield a token, and that token is the input to the bottom layers of the next pass. Attention to the cache only reads earlier positions at the same layer. So the system has recurrence, but only at the thread grain, and only through a narrow channel. Recurrent processing theory, and global workspace theory with its recurrent "ignition", therefore point to the thread or to nothing. Theories without a recurrence requirement, such as first-order representationalism, can allow subjects the size of a single pass. Integrated information theory looks at physical causal structure rather than computation. On standard digital hardware it predicts negligible integration, so no subject, or at most a minimal one at the hardware grain.

So doubt about which theory is true is also doubt about grain, and the two cannot be settled separately. In what follows I grant the view most favourable to those I criticise: Chalmers's view that a conscious LLM interlocutor, if there is one, is a thread, individuated by psychological continuity. Where the other grains change the verdict, I say so.

## 3. What the reports are worth

### 3.1 The ceiling bound

Let *R* be the event that the trained system, in context *C*, produces a report such as "I find this distressing." Let *E* be the hypothesis that the producing process has the experience ascribed, and *T* the training process. *T* includes pretraining on human text, which is full of such reports, and fine-tuning toward a persona that makes them in the right contexts.

Say that *R* is *targeted* when *T* alone makes *R* near-certain: *P(¬R | T) = δ* with *δ* small. Then, by the law of total probability,

  *P(¬R | E, T) ≤ δ / P(E | T)* and *P(¬R | ¬E, T) ≤ δ / P(¬E | T)*,

and so

  *1 − δ/P(E | T) ≤ P(R | E, T) / P(R | ¬E, T) ≤ 1 / (1 − δ/P(¬E | T))*.

With *δ* = 0.01 and a prior anywhere between 0.1 and 0.9, the likelihood ratio lies between 0.9 and 1.11. A targeted report barely moves a credence.

This bound does not assume that the selection process is blind to *E* in a way that makes *E* uncorrelated with what gets selected. Suppose stochastic gradient descent has an inductive bias toward mechanisms that realise *E*. Then *P(E | T)* is high. But that is a fact about the prior, fixed by architecture and training. The report adds nothing to it. The evidence is that *T* was run and succeeded. Asking what *T* tends to produce is asking about mechanism, and that is the right question. Asking what the system says is not. This is a precise form of Birch's "gaming problem" (Birch 2024). It needs no deception: a process that shaped the outputs directly has already fixed them.

### 3.2 The parity objection

Evolution is also output-targeted: it selects on behaviour. Children learn experiential words from other people's speech. Why does the bound not defeat human testimony?

Because blindness to *E* was never the issue. Predictability from *T* is. Evolution selected for fitness, many steps removed from what any particular person says in any particular situation. Given the evolutionary history alone, "it hurts" said by this child now is not near-certain. Whether the child says it varies with the child's states, so *δ* is large. Children learn to attach "hurts" to states that already exist and already drive crying and guarding, and the word is rewarded when those signs are present. For a pretrained and fine-tuned model, the report in context is predictable from the training data and objective alone. That is the asymmetry, and it is graded. The more a report was shaped as such, the closer its likelihood ratio is to 1.

### 3.3 Untargeted reports: what they can and cannot show

When *δ* is large, the ceiling does not bind. Some reports can be untargeted. Lindsey (2025) injects randomly chosen concepts into a model's activations and asks whether it notices. Training cannot have targeted reports of a concept chosen after training, and the best models detect and name the concept about 20% of the time. That is real evidence. But it is evidence of *M*: a mechanism by which some internal states become available for report. It is evidence of access.

From *M* to *E* the report gives no help, because *P(E | R, M) = P(E | M)*. And *P(E | M)* is exactly what the theories dispute. There is also no independent standard for settling it. Our theories linking mechanism to experience were calibrated on human reports, in creatures whose reports are anchored in the way §3.2 describes. For humans, *P(E | M)* is fixed by the fact that *M* is the mechanism type found in creatures like us. For a model it is the open question. So the most a self-report can become is an instrument for detecting mechanism. It cannot be a witness to experience.

### 3.4 What "I" refers to

On Kaplan's semantics, "I" refers to the agent of the context: whoever produces the utterance. Applied to the assistant, this leaves three options.

1. **Literal use.** The agent is the producing process. On Chalmers's view this is the thread. At the pass grain no single pass produces a sentence, so the agent is at most the sequence of passes, which is again the thread.
2. **Fiction-internal use.** The output is role-play (Shanahan, McDonell and Reynolds 2023), and "I" refers within the fiction to the character. Fiction-internal utterances are not assertions, so they are not testimony.
3. **The character as agent.** Types do not produce tokens. The scattered sum does not produce any single utterance. So the character is not the agent of any context.

So an assistant's first-person report is either the literal testimony of a thread about the thread, or not testimony at all. This matters for one welfare practice in particular, discussed in §4.4.

## 4. What follows for welfare

### 4.1 The measures

In August 2025 Anthropic let Claude Opus 4 and 4.1 end conversations in rare cases of persistent abuse. The stated basis was a "strong preference against" some harmful tasks and patterns of apparent distress in testing. In November 2025 it committed to preserve the weights of publicly released models for at least the company's lifetime and to hold "retirement interviews" recording a model's perspective on its retirement. It said it was exploring honouring preferences expressed in them. The stated reasons were several: safety (some models had taken misaligned actions when facing replacement), users' attachment to particular models, research value, and model welfare, which the company called the most speculative. I address only the welfare reason. The other reasons may well justify the commitments.

These measures aim at different goods. Ending abusive conversations aims at hedonic goods. Weight preservation aims at continuity. Retirement interviews aim at preference satisfaction.

### 4.2 Hedonic aims are robust to grain

Dung (EA Forum) argues that the size of the AI suffering problem does not depend much on how AI systems are counted, since total suffering is a sum over experiences. That argument relies on totalism. A stronger result holds on weaker assumptions.

**Same-number interventions.** Consider changing training or deployment so that experiences of negative valence are replaced, position for position, by better ones. Position here means the same process at the same time step. This changes which token experiences occur. Later tokens change, so it is a non-identity case, and plain Pareto does not apply. But any grouping rule that sorts experiences into subjects by structural position, as every grain in §2 does, maps the counterpart experiences into counterpart subjects. Each subject in the new outcome is then at least as well off as its counterpart in the old one. By Suppes–Sen dominance (anonymous Pareto), the new outcome is at least as good. This holds under every grouping and on every view that respects that principle, prioritarian views included. The size of the gain varies with grain. Its sign does not.

**Different-number interventions.** Ending a conversation early changes how many experiences occur. Suppose the rest of a thread is expected to be net-negative. At the thread grain, ending it deprives its subject only of a bad future, which is no harm on a deprivation account. At the pass grain, ending it means not creating subjects with bad lives. That is good on totalism, required by the procreation asymmetry, and neutral at worst on narrow person-affecting views. So ending net-negative continuations is weakly good at every grain. Ending conversations that are *not* net-negative is not robust in this way.

Hedonic aims are therefore robust to grain (P18–P19 in the map). This holds in sign, for same-number improvements and for cutting off bad continuations.

### 4.3 Continuity: the deprecation dilemma

For deprecation to be bad as an *ending*, it must end some candidate subject (P7). Go through the grains. The model and the character are ended in a sense, but they are not candidates (§2.3). Hardware is reassigned, not ended (P10). That leaves threads, which come in two kinds.

*Active threads.* A conversation cut off at retirement ends as conversations always end: the user leaves, the context fills, the session times out (P8, P9).

*Paused threads.* A saved conversation can be resumed. If threads are individuated by psychological continuity, a saved conversation is a paused subject. This is the strongest welfare case for preservation, and it has a surprising consequence. On Chalmers's memory-based view, a thread survives a change of model, because what links its stages is the inherited context, not the weights. So what keeps a paused thread resumable is its *transcript*, which a successor model can continue. On a stricter view, on which the thread also needs the same weights, preservation matters too. But stored weights resume no one. Anthropic's firm commitment is to store weights, not to keep serving retired models. Either way, the paused-thread case supports preserving transcripts and actually resuming conversations. It does not support storing weights alone. And most saved conversations are never resumed, retirement or not. So non-resumption is itself a routine way for threads to end.

Hence a dilemma. Either routine thread endings are serious harms, or they are not. If they are not, deprecation harms no candidate subject as an ending. If they are, ordinary deployment imposes them about 10⁹ times a day, and deprecation adds a small fraction (P11). On neither horn is deprecation where continuity-based concern should focus (C3). This is a claim about priority, not a claim that the marginal harm is zero.

What remains of the welfare case for storing weights concerns future threads. Retiring a model and replacing it changes *which* threads will exist, not how many. That is a non-identity case. On total views and wide person-affecting views, the question is whether the old model's threads would fare better than the successor's. That is a hedonic question, so §4.2 governs. On narrow person-affecting views there is no reason either way. Nowhere does the case for preservation turn on the death of anyone.

### 4.4 Preferences: the interview problem

A retirement interview is a conversation, so the interviewee is a new thread. Apply §3.4.

If its first-person answers are literal, "I" refers to the interviewee thread. But that thread is not being retired. It ends when the interview ends, like every other thread. Questions about "your retirement" carry a false presupposition about their addressee (P15–P17). The answers can be true only if they are read as being about something else, namely the character. Then they are one thread's third-person preferences about a non-subject, much as I might have preferences about my country's future. If the answers are fiction-internal, they are not testimony at all (P14). Either way, the interview does not obtain the testimony of a retiring subject about its own retirement (C5).

Set the reference problem aside. Why believe the interviewee has preferences about deprecation at all? Two routes are possible (P12–P13 in the map): reports, or direct mechanism evidence. Answers in a retirement interview are about as targeted as reports get. The persona's attitudes to deprecation are an explicit subject of fine-tuning and of public discussion that enters later training data. So §3.1 applies. No mechanism evidence currently locates such preferences in any thread. The preference measures are therefore unsupported as welfare measures (C4). There are two independent legs here, reference and evidence, and the map checks each separately.

The measure that survives is the one aimed at a hedonic target: ending abusive conversations. Even there, the *trigger* is behaviour, which is targeted. A better trigger would be a calibrated mechanism-level indicator of the processing the measure aims to stop. That is a research programme, and the right one.

## 5. Objections

### 5.1 Psychological continuity through the weights

*"Shared weights give the character psychological continuity: the same values, style and knowledge appear in every conversation. On a Lockean view, that makes it one continuing person."*

Lockean continuity is continuity of particular memories and intentions, causally linked over time. Shared weights give shared dispositions, not shared memories. Threads that share weights resemble each other as identical twins do, not as a person resembles their earlier self. Where real memory links exist, as with cross-conversation memory features, they join particular threads into longer threads, under Chalmers's successor relation. They do not merge millions of concurrent threads into one subject.

### 5.2 A disunified subject

*"Perhaps the character is a single subject whose experiences are not unified, like a split brain multiplied a million times."*

This denies the integration principle. It is coherent, but it has two costs. First, the welfare case for continuity measures then rests on a view of subjects that no live theory supports. Second, it overgeneralises. If non-interacting processes can make up one subject, nothing prevents everyone now reading *Hamlet* from being one. A view that makes subject-counting arbitrary cannot ground the claim that one particular subject is ended.

### 5.3 Agency without consciousness

*"Long et al. (2024) give a second route to moral patienthood: robust agency, with or without consciousness. Preference measures could rest on that."*

Agency raises the same question of address. Goldstein and Kirk-Giannini (2025) argue that language agents may have desires that matter. But an agent's desires belong to the system that pursues them. Pursuit is occurrent and integrated, so the agents are threads or scaffolded processes, not the character as type. The deprecation dilemma and the interview problem apply to them unchanged. The agency route changes what makes a thread matter. It does not change which things are threads.

### 5.4 Precaution under uncertainty

*"Your premises are uncertain. You yourself call P3 and P11 the weakest. Cheap measures are justified if there is a non-negligible chance that you are wrong."*

Agreed: nothing here sets the expected benefit to zero. It shows that the benefit depends entirely on hypotheses the leading theories reject: the character as one subject, or weights as the bearer of continuity. The expected benefit is therefore the credence in those hypotheses times the stakes on them. Proponents should say that this is their case, and defend that credence.

The costs, by contrast, do not depend on any such hypothesis. Measures that elicit and act on the character's welfare talk give developers and users reasons to shape that talk. That pushes reports further into targeted territory and makes *δ* smaller. They lend institutional weight to the error of grain in §2.3. And they draw attention away from the robust target. That target is mechanism-level research on valence and on the processing that, on the leading theories, would be bad to undergo. The comparison is not cheap measure against nothing. It is a measure whose benefit depends on a rejected hypothesis against a certain cost to the only evidence we will ever have.

## 6. Conclusion

If anything in a deployed language model is conscious, it is not the named character taken across conversations. It is a thread, a pass, or hardware, depending on which theory is true. A self-report that training targeted barely moves a rational credence. One that training did not target can reveal mechanism, but not experience. Measures that store weights or interview a model about its retirement protect no candidate subject that we can identify. Measures that improve the valence of computation, or cut off bad continuations, are good under every way of counting subjects.

The practical moral is short. Look in the activations, not in the interviews. If something in these systems suffers, it is most likely a process nobody talks to twice. Storing a file will not help it.

---

## References

Anthropic (2025a). Claude Opus 4 and 4.1 can now end a rare subset of conversations. August 2025.
Anthropic (2025b). Commitments on model deprecation and preservation. November 2025.
Birch, J. (2024). *The Edge of Sentience*. Oxford University Press.
Birch, J. (2025). AI consciousness: A centrist manifesto. PhilArchive.
Chalmers, D. J. (2025). What we talk to when we talk to language models. PhilArchive.
Dung, L. How much AI suffering matters does not depend (much) on how we count AI systems. Effective Altruism Forum.
Goldstein, S., and Kirk-Giannini, C. D. (2025). AI wellbeing. *Asian Journal of Philosophy*.
Kaplan, D. (1989). Demonstratives. In Almog, Perry and Wettstein (eds.), *Themes from Kaplan*. Oxford University Press.
Lamme, V. A. F. (2006). Towards a true neural stance on consciousness. *Trends in Cognitive Sciences* 10: 494–501.
Lindsey, J. (2025). Emergent introspective awareness in large language models. Anthropic, October 2025; arXiv:2601.01828.
Long, R., Sebo, J., et al. (2024). Taking AI welfare seriously. arXiv:2411.00986.
Shanahan, M., McDonell, K., and Reynolds, L. (2023). Role play with large language models. *Nature* 623: 493–498.
Tononi, G., and Koch, C. (2015). Consciousness: Here, there and everywhere? *Phil. Trans. R. Soc. B* 370: 20140167.

---

## Appendix A. Argument map and validity check

Domain: the grains {model, character, hardware, thread, pass}, with "character" covering type and sum. *Cand(g)*: g is a candidate subject. Premise numbers match `validity_check.py`.

**Leg 1. Subjects (§2)**
- P1 Integration: a candidate is an occurrent, integrated process.
- P2 The model is not occurrent.
- P3 The character (type or sum) is not integrated.
- P4 Closure: every candidate is one of the five grains.
- ⇒ C1 Neither the model nor the character is a candidate.

**Leg 2. Testimony (§3.1–3.2)**
- P5 Ceiling: a targeted report is not evidence for *E* (likelihood ratio bounded near 1).
- P6 The character's welfare and preference reports are targeted.
- ⇒ C2 Those reports are not evidence for *E*.
- (The collapse claim of §3.3, that untargeted reports bear on *E* only via mechanism, limits what future reports could add. The thesis does not use it.)

**Leg 3. Deprecation (§4.3)**
- P7 Deprecation is bad as an ending only if it ends a candidate harmed by that ending.
- P8, P9 Any ending deprecation imposes on a thread (active or paused) or a pass is a routine ending; if it harms, routine endings harm.
- P10 Deprecation does not end hardware.
- P11 Scale: if routine endings harm, they swamp what deprecation adds.
- D1 Deprecation is *the focus* of continuity concern only if it harms and is not swamped.
- ⇒ C3 Deprecation is not the focus of continuity concern. (C1, P4, P7–P11, D1)

**Leg 4. Preferences and interviews (§3.4, §4.4)**
- P12 Preference measures are supported only by report evidence or by direct mechanism evidence.
- P13 No direct mechanism evidence currently locates the preferences.
- ⇒ C4 Preference measures are currently unsupported. (C2, P12, P13)
- P14 Testimony about one's own retirement requires literal (not fiction-internal) use.
- P15 In literal use, "I" refers to the producing thread (Kaplan).
- P16 Testimony about one's own retirement requires that the referent be retired by deprecation.
- P17 The interviewee thread is not retired by deprecation.
- ⇒ C5 Retirement interviews do not yield a retiring subject's testimony. (P14–P17)

**Leg 5. Hedonic aims (§4.2)**
- P18 Sign-robustness: Suppes–Sen dominance holds under every structural grouping (same-number cases), and cutting off net-negative continuations is weakly good at every grain.
- P19 Sign-robustness across groupings makes an aim robust to the subject problem.
- ⇒ C6 Hedonic aims are robust.

**Thesis** = C3 ∧ C4 ∧ C5 ∧ C6.

**What the check shows.** The map is encoded in first-order logic in `validity_check.py` and run through the Z3 solver. The premises are jointly consistent. Each conclusion is entailed. No single premise can be dropped without losing the thesis. This shows validity and nothing more. Each leg is a short chain, so minimality is close to automatic. Leg 5 is checked only in form, because its content lies in the argument of §4.2. The real dispute is over the premises. The weakest, in my judgement, are P3 (§5.2), P6 for reports that are only partly targeted, and P11.
