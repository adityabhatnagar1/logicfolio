An AND gate outputs 1 only when both of its inputs are 1.

Think of two switches wired in series: the lamp lights only when both switches are closed. If either one is open, no current flows. That is why AND is used wherever several conditions must all be true at the same time.

$$
Y = A \cdot B
$$

| A | B | Y |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench sweeps all four input combinations and checks the output against the AND function.
