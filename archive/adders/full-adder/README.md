A full adder adds two bits plus an incoming carry. Two half adders and an OR gate give the same result.

$$
S = A \oplus B \oplus C_{in}, \qquad C_{out} = AB + C_{in}(A \oplus B)
$$

Simulate with `iverilog -o sim tb.v design.v && vvp sim`.
