An OR gate outputs 1 when at least one of its inputs is 1.

Picture two switches wired in parallel. Current can take either path, so the lamp lights if switch A is closed, switch B is closed, or both are closed. OR gates are useful when any one of several conditions should trigger an action.

$$
Y = A + B
$$

| A | B | Y |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 1 |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench sweeps all four input combinations and checks the output against the OR function.
