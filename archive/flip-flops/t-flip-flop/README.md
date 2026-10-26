A T flip-flop flips its output on a clock edge when T is high and leaves it alone when T is low.

It behaves like a push-on, push-off button that only reacts on the clock tick. Hold T high and the output alternates 0, 1, 0, 1, switching at half the speed of the clock. That halving is why chains of T flip-flops make binary counters and frequency dividers. It can be built from a D flip-flop by feeding the inverted output back, or from a JK flip-flop with J and K tied together.

This version has an asynchronous reset so it starts from a known value.

$$ Q^{+} = T \oplus Q \quad \text{on the rising edge of } clk $$

| T | Q next |
|---|--------|
| 0 | Q      |
| 1 | inverse of Q |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench sweeps the stored value and T, then holds T high to watch the output alternate.
