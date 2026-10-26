A 2:1 multiplexer uses one select line to pass one of two data inputs through to the output.

Think of a railway switch: one track leads in from each side, and the lever decides which one gets through to the single track ahead. This is the smallest multiplexer, and every larger one in this archive is built by chaining copies of it together.

$$ Y = \overline{S}\,I_0 + S\,I_1 $$

| S   | Y   |
| --- | --- |
| 0   | I0  |
| 1   | I1  |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`.
