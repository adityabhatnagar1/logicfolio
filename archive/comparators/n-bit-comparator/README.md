An N-bit comparator checks two unsigned binary numbers of any width and reports which is larger, or whether they match.

It is the same idea as the 2-bit version stretched to any length, like comparing two long numbers digit by digit from the left. The width is a parameter, so one description covers 4 bits, 8 bits, or 32 bits.

$$ G = (A > B), \qquad E = (A = B), \qquad L = (A < B), \qquad A, B \in [0,\, 2^{N}-1] $$

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench sweeps all 256 input pairs at N = 4.
