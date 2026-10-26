A 1:2 demultiplexer sends one data input to one of two outputs, chosen by a single select line.

It is the multiplexer run backwards. Think of a railway switch again, but this time one track comes in and the lever decides which of two tracks the train leaves on. The output that is not selected stays at 0. Every larger demultiplexer in this archive is built from copies of this one.

$$ Y_0 = \overline{S}\,I, \qquad Y_1 = S\,I $$

| S | I | Y0 | Y1 |
|---|---|----|----|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 0 | 0 |
| 1 | 1 | 0 | 1 |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`.
