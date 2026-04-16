# The Ticket System: Teaching an AI to Remember What It Already Figured Out

Early on, Sam would troubleshoot something — a misbehaving server, a flaky service, a recurring network glitch — and we'd get to a working fix. Then the session would end, context would reset, and a few weeks later the same problem would come back. Sam had no idea we'd already solved it. "We talked about this before" wasn't a phrase it could actually say.

The frustration wasn't the troubleshooting — it was that the knowledge didn't stick. Sam's memory is fresh every session.

The solution was building a system of overlapping memory layers — the most important being a **handoff protocol** where Sam checkpointed every session's decisions to a shared file before shutting down. The next session would read it and pick up where we left off. That worked for active work, but it didn't help when the *same problem* showed up six weeks later under completely different context.

The ticket system became the long-term memory layer underneath that. Not session-persistent, but *problem-persistent*. When Sam closes a ticket, the knowledge survives session resets, model swaps, and gaps in context.

The insight that made it possible: **LLMs can read and write markdown natively**. The filesystem *is* the database. No ORM, no schema migrations, no SQL. Just files with frontmatter that an AI can parse without any special tooling. Sam writes a ticket the same way it writes a Slack message — directly, in context, without a layer of tooling between it and the data.

There are other apps in the ShireWorks pipeline that share the same DNA — built AI-native from the ground up, not AI bolted onto a human-facing tool. The ticket system is where that architecture shows clearest.

**The hard lesson:** Version 0.1 shipped without a structured edit modal. Users had to write markdown by hand. We built 0.2 with a proper form because the markdown-first approach was a barrier for human users — sometimes the AI-friendly format and the human-friendly format need to be different layers on top of the same data.
