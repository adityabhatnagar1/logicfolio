// D flip-flop with asynchronous preset (q to 1) and clear (q to 0); clear wins if both are high.
module d_flip_flop_with_preset_and_clear (
    input  wire clk,
    input  wire d,
    input  wire preset,
    input  wire clear,
    output reg  q
);
    always @(posedge clk or posedge preset or posedge clear)
        if (clear)
            q <= 1'b0;
        else if (preset)
            q <= 1'b1;
        else
            q <= d;
endmodule
