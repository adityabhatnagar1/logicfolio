// D flip-flop with asynchronous reset: rst clears q to 0 at once, whatever the clock is doing.
module d_flip_flop_with_asynchronous_reset (
    input  wire clk,
    input  wire rst,
    input  wire d,
    output reg  q
);
    always @(posedge clk or posedge rst)
        if (rst)
            q <= 1'b0;
        else
            q <= d;
endmodule
