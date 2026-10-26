A ripple-carry adder chains N full adders so each stage's carry-out feeds the next stage's carry-in. It is small but slow: the carry must travel through every stage.

$$
S_i = A_i \oplus B_i \oplus C_i, \qquad C_{i+1} = A_i B_i + C_i (A_i \oplus B_i)
$$

Simulate with `iverilog -o sim tb.v design.v full_adder.v && vvp sim`. The testbench sweeps all 512 input combinations of the 4-bit instance.
