A half adder adds two single bits and produces a sum bit and a carry bit. With no carry input it cannot be chained on its own.

$$
S = A \oplus B, \qquad C_{out} = A \cdot B
$$

| A | B | Sum | Carry |
|---|---|-----|-------|
| 0 | 0 | 0   | 0     |
| 0 | 1 | 1   | 0     |
| 1 | 0 | 1   | 0     |
| 1 | 1 | 0   | 1     |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`.
