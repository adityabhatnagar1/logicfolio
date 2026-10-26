`timescale 1ns/1ps

module tb_tri_state_buffer;
    reg  a, en;
    wire y;
    reg  expected;
    integer i, errors;

    tri_state_buffer dut (
        .a(a),
        .en(en),
        .y(y)
    );

    initial begin
        $dumpfile("tri_state_buffer.vcd");
        $dumpvars(0, tb_tri_state_buffer);
        errors = 0;
        for (i = 0; i < 4; i = i + 1) begin
            {en, a} = i[1:0];
            #10;
            expected = en ? a : 1'bz;
            if (y !== expected) begin
                errors = errors + 1;
                $display("FAIL en=%b a=%b y=%b expected=%b", en, a, y, expected);
            end
        end
        $display("tri_state_buffer: %0d errors", errors);
        $finish;
    end
endmodule
