// Passes its input to the output when enabled, otherwise leaves the output floating at high impedance.
module tri_state_buffer (
    input  wire a,
    input  wire en,
    output wire y
);
    assign y = en ? a : 1'bz;
endmodule
