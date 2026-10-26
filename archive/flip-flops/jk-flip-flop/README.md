A JK flip-flop works like an SR flip-flop, but the "both inputs high" case flips the output instead of being forbidden.

J is the set button, K is the reset button, and pressing both makes the output switch to the opposite of whatever it was, like a push-button lamp. Every combination now has a useful meaning, which is why JK flip-flops were a popular building block for counters.

$$ Q^{+} = J \cdot \overline{Q} + \overline{K} \cdot Q \quad \text{on the rising edge of } clk $$

| J | K | Q next |
|---|---|--------|
| 0 | 0 | Q      |
| 0 | 1 | 0      |
| 1 | 0 | 1      |
| 1 | 1 | inverse of Q |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench sweeps the stored value with all four J and K pairs, then toggles repeatedly.
