A NAND gate outputs 0 only when both inputs are 1; it is an AND gate followed by an inverter.

NAND stands for NOT-AND. It is called a universal gate because any other logic gate can be built using only NAND gates. That makes it the Lego brick of digital logic: from enough identical NAND blocks, you can assemble an entire processor.

$$
Y = \overline{A \cdot B}
$$

| A | B | Y |
|---|---|---|
| 0 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench sweeps all four input combinations and checks the output against the NAND function.
