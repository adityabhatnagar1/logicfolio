A gated D latch copies its data input to the output while enable is high, then freezes that value when enable goes low.

It is a window that opens and closes. While the window is open, whatever D shows is passed straight through, so the output keeps up with it. The moment the window shuts, the last thing seen is locked in. Wiring R to the inverse of S, so only one of them can ever be active, removes the forbidden state of the SR latch.

Because the output follows D the whole time the window is open, this is called transparent. Edge-triggered flip-flops fix that by sampling at a single instant.

$$ S = en \cdot D, \quad R = en \cdot \overline{D}, \qquad Q^{+} = en \cdot D + \overline{en} \cdot Q $$

| en | D | Q next |
|----|---|--------|
| 0  | x | Q      |
| 1  | 0 | 0      |
| 1  | 1 | 1      |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench sweeps every ordered pair of en and D values.
