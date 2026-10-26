`timescale 1ns/1ps

module tb_decoder_3to8;
    reg        en;
    reg  [2:0] a;
    wire [7:0] y;
    reg  [7:0] expected;
    integer i, errors;

    decoder_3to8 dut (
        .en(en),
        .a(a),
        .y(y)
    );

    initial begin
        $dumpfile("decoder_3to8.vcd");
        $dumpvars(0, tb_decoder_3to8);
        errors = 0;
        for (i = 0; i < 16; i = i + 1) begin
            {en, a} = i[3:0];
            #10;
            expected = en ? (8'b00000001 << a) : 8'b00000000;
            if (y !== expected) begin
                errors = errors + 1;
                $display("FAIL en=%b a=%b y=%b expected=%b", en, a, y, expected);
            end
        end
        $display("decoder_3to8: %0d errors", errors);
        $finish;
    end
endmodule
