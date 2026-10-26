A tri-state buffer either passes its input to the output or disconnects from the output entirely, depending on an enable line.

Think of a meeting where several people share one microphone line. Only the person whose switch is on is heard; everyone else is cut off, neither speaking nor pulling the line either way. That cut-off state is high impedance, written Z, and it is the third state beside 0 and 1. It lets many devices share one physical bus. If two buffers drove the same wire with different values at once, the circuit would short and the line would read X. So a design must enable at most one buffer on a bus at a time, and a decoder is often what guarantees this.

$$ Y = \begin{cases} A & EN = 1 \\ Z & EN = 0 \end{cases} $$

| EN | A | Y |
|----|---|---|
| 0 | 0 | Z |
| 0 | 1 | Z |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench sweeps all 4 combinations of enable and data bits and checks that the disabled output reads Z.
