An SR latch is the simplest memory cell: two NOR gates feed each other, so the circuit remembers the last input that touched it.

Think of a light switch with two buttons, one that only turns the light on and one that only turns it off. Pressing neither leaves the light as it was. That "leave it as it was" state is the memory.

The trouble is pressing both buttons at once. Both outputs are forced low, which breaks the rule that Q and its inverse are opposites, and letting go of both together leaves the result up to chance. Real designs simply avoid S = R = 1.

$$ Q = \overline{R + \overline{Q}}, \qquad \overline{Q} = \overline{S + Q} $$

| S | R | Q next | Meaning |
|---|---|--------|---------|
| 0 | 0 | Q      | hold    |
| 0 | 1 | 0      | reset   |
| 1 | 0 | 1      | set     |
| 1 | 1 | 0 (and inverse also 0) | forbidden |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`.
