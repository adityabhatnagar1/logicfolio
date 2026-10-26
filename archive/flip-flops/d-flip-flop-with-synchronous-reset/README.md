A D flip-flop with synchronous reset clears its output to zero when reset is asserted, but only at the next rising clock edge.

Think of a class where the teacher wipes the whiteboard only at the sound of the bell. Even if you ask for it to be wiped earlier, nothing happens until the bell rings. That keeps every change lined up with the clock, which makes timing easy to reason about, at the cost of needing a running clock for the reset to work.

$$ Q^{+} = \overline{rst} \cdot D \quad \text{on the rising edge of } clk $$

| rst | D | Q next |
|-----|---|--------|
| 1   | x | 0      |
| 0   | 0 | 0      |
| 0   | 1 | 1      |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench also checks that Q does not move before the clock edge.
