A 2-bit comparator compares two numbers from 0 to 3 and reports whether the first is greater, equal, or less.

It works like comparing two-digit numbers on paper: look at the left digit first, and only if those match do you look at the right one. Here the "digits" are bits, and the left bit carries the most weight.

$$ E_1 = \overline{A_1 \oplus B_1}, \qquad G = A_1\overline{B_1} + E_1 A_0\overline{B_0}, \qquad L = \overline{A_1}B_1 + E_1 \overline{A_0}B_0, \qquad E = E_1 \cdot \overline{A_0 \oplus B_0} $$

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench sweeps all 16 input pairs.
