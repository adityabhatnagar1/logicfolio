A 1-bit comparator looks at two single bits and says which one is bigger, or whether they are the same.

Think of two light switches. If the first is on and the second is off, the first is greater. If both match, they are equal. Exactly one of the three outputs is high at any time.

$$ G = A\overline{B}, \qquad E = \overline{A \oplus B}, \qquad L = \overline{A}B $$

| A   | B   | G   | E   | L   |
| --- | --- | --- | --- | --- |
| 0   | 0   | 0   | 1   | 0   |
| 0   | 1   | 0   | 0   | 1   |
| 1   | 0   | 1   | 0   | 0   |
| 1   | 1   | 0   | 1   | 0   |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`.
