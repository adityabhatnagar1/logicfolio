`timescale 1ns/1ps
module tb_d_flip_flop_with_preset_and_clear;
    reg  clk, d, preset, clear;
    wire q;
    integer i, errors;

    d_flip_flop_with_preset_and_clear dut (
        .clk(clk),
        .d(d),
        .preset(preset),
        .clear(clear),
        .q(q)
    );

    task tick;
        begin
            #5 clk = 1;
            #5 clk = 0;
        end
    endtask

    task check;
        input exp;
        input [127:0] what;
        begin
            if (q !== exp) begin
                errors = errors + 1;
                $display("FAIL %0s : q=%b (expected %b)", what, q, exp);
            end
        end
    endtask

    initial begin
        $dumpfile("d_flip_flop_with_preset_and_clear.vcd");
        $dumpvars(0, tb_d_flip_flop_with_preset_and_clear);
        errors = 0;
        clk = 0;
        d = 0;
        preset = 0;
        clear = 0;
        #1;

        // clear and preset act at once and are remembered after release
        for (i = 0; i < 3; i = i + 1) begin
            clear = 1;  #1; check(1'b0, "clear");
            clear = 0;  #1; check(1'b0, "hold after clear");
            preset = 1; #1; check(1'b1, "preset");
            preset = 0; #1; check(1'b1, "hold after preset");
        end

        // normal clocked behaviour
        clear = 1; #1; clear = 0;
        d = 1; tick; check(1'b1, "load 1");
        d = 0; tick; check(1'b0, "load 0");

        // overrides beat the clock
        preset = 1; #1;
        d = 0; tick; check(1'b1, "preset beats clock");
        preset = 0;
        d = 0; tick; check(1'b0, "clock works again");
        clear = 1; #1;
        d = 1; tick; check(1'b0, "clear beats clock");
        clear = 0;

        // both asserted: clear wins
        clear = 1; #1;
        preset = 1; #1; check(1'b0, "clear wins when both set");
        d = 1; tick; check(1'b0, "clear wins on clock edge");
        preset = 0; #1; clear = 0; #1; check(1'b0, "hold after both released");

        $display("d_flip_flop_with_preset_and_clear: %0d errors", errors);
        $finish;
    end
endmodule
