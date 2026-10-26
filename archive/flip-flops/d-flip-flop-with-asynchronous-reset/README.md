A D flip-flop with asynchronous reset clears its output to zero the instant reset is asserted, without waiting for the clock.

This is the emergency stop of the flip-flop world. A synchronous reset waits politely for the next clock tick, while an asynchronous one acts immediately and overrides everything else. Chips use it to force a known starting state at power-up, even before the clock is running. Releasing the reset too close to a clock edge can cause trouble, so designers usually release it in step with the clock.

$$ Q = 0 \;\text{ while } rst = 1, \qquad Q^{+} = D \;\text{ on the rising edge of } clk \text{ when } rst = 0 $$

| rst | clk  | D | Q next |
|-----|------|---|--------|
| 1   | x    | x | 0 (immediately) |
| 0   | rise | 0 | 0      |
| 0   | rise | 1 | 1      |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench asserts reset while the clock is low to show the output clears at once.
