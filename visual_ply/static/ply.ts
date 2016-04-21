/// <reference path="libs/jquery.d.ts" />
/// <reference path="libs/d3.d.ts" />

function do_load() {

    //console.log(JSON.stringify(root_node, null, 4));

    var ply = new AstTree();
}



function get_node_data(node_name) {
    var data = null;
    $.ajax({
        url: '/ply?node=' + node_name,
        type: 'GET',
        async: false,
        dataType: 'json',
        timeout: 3000,
        success: function (_data, textStatus, jqXHR) {
            data = _data;
        },
        error: function (xhr, status, error) {
            alert('Can not access API [ /ply?node=xxx ]');
            return;
        }
    });
    return data;
}


class Ast {
    constructor(public id,
                public name,
                public width,
                public px = 0,
                public py = 0,
                public children: any = [],
                public parent: any = {id: null, px: null, py: null}) {
    }
}


class AstTree {
    serial = 1;
    vRad = 10;
    tier_height = 70;
    ast = null;
    curr_node = null;

    constructor() {
        this.bind_root_event();
        this.addChildren(null);
    }

    bind_root_event() {
        var _tree = this;

        d3.select("#g_rects").selectAll('rect').data([]).enter()
            .append('rect').attr('r', this.vRad)
            .on('click', function (d) {
                return _tree.addChildren(d);
            });

        d3.select("#g_labels").selectAll('text').data([]).enter()
            .append('text')
            .on('click', function (d) {
                return _tree.addChildren(d);
            });
    }

    getVertices() {
        var v = [];
        function _getVertices(t) {
            v.push(t);
            for (var d of t.children ) {
                _getVertices(d);
            }
        }
        _getVertices(this.ast);
        return v.sort(
            function (a, b) {
                return a.id - b.id;
            }
        );
    }

    getEdges() {
        var e = [];

        function _getEdges(_) {
            for (var children of _.children) {
                e.push(children);
                _getEdges(children);
            }
        }

        _getEdges(this.ast);
        return e.sort(function (a, b) { return a.id - b.id; });
    }

    addChildren(parent) {
        if (parent) {
            var node = get_node_data(parent.name);
        } else {
            var node = get_node_data('__root__');
            var id = this.serial++;
            this.ast = new Ast(id, node.name, node.width, window.innerWidth/2 - 20, 30);
            this.addAst(null, this.ast);
            parent = this.ast;
        }

        this.curr_node = parent;

        for (var children_data of node.children ){
            var id = this.serial++;
            var children = new Ast(id, children_data.name, children_data.width);
            this.addAst(parent, children);
        }

        function _clear(ast) {
            var new_children = [];
            for (var children of ast.children) {
                if (children.parent.px == ast.px && children.parent.py == ast.py) {
                    new_children.push(children);
                    _clear(children)
                }
            }
            ast.children = new_children;
        }

        _clear(this.ast);

        this.reposition(this.ast);

        this.redraw();
    }

    addAst(parent, c_ast) {
        if (parent) {
            c_ast.parent = {id: parent.id, px: parent.px, py: parent.py};
        }
        function _add(ast) {
            if (ast.id == c_ast.parent.id) {
                ast.children.push(c_ast);
                return true;
            }
            for (var children of ast.children) {
                if (_add(children)){
                    return true;
                }
            }
            return false;
        }
        _add(this.ast);
    }

    redraw() {
        var _tree = this;
        var edges = d3.select("#g_lines").selectAll('line').data(this.getEdges());
        edges.enter().append('line')
            .attr('x1', function (d) { return d.parent.px; })
            .attr('y1', function (d) { return d.parent.py + _tree.vRad - 1; })
            .attr('x2', function (d) { return d.px; })
            .attr('y2', function (d) { return d.py - _tree.vRad; });

        var rects = d3.select("#g_rects").selectAll('rect').data(this.getVertices());
        rects.enter().append('rect')
            .attr('height', this.vRad * 2)
            .attr('width', function (d) { return d.width; })
            .attr('x', function (d) { return d.px - d.width / 2; })
            .attr('y', function (d) { return d.py - _tree.vRad; })
            .on('click', function (d) { return _tree.addChildren(d); });
        
        var labels = d3.select("#g_labels").selectAll('text').data(this.getVertices());
        labels.enter().append('text')
            .text(function (d) { return d.name; })
            .attr('x', function (d) { return d.px; })
            .attr('y', function (d) { return d.py + 5; })
            .on('click', function (d) { return _tree.addChildren(d); });
    }

    reposition(ast) {
        var children_width = 0;
        for (var children of ast.children) {
            children_width += children.width;
        }
        var left = ast.px - children_width / 2;
        for (var children of ast.children) {
            children.px = left + children.width / 2;
            children.py = ast.py + this.tier_height;
            left += children.width;
            this.reposition(children);
        }
        console.log(ast);
    }
}
