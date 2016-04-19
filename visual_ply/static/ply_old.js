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


//
//
//var Tree = {
//
//    createNew: function (root_node) {
//        var tree = {cx: 800, cy: 30, w: 60, h: 70};
//        tree.root_node = root_node;
//        tree.vis = {v: 0, l: root_node.name, p: {x: tree.cx, y: tree.cy}, c: []};
//        tree.size = 1;
//        tree.glabels = [];
//        tree.incX = 700, tree.incY = 30, tree.incS = 20;
//        return tree;
//    },
//
//    getVertices: function () {
//        var v = [];
//
//        function _getVertices(t, f) {
//            v.push({v: t.v, l: t.l, p: t.p, f: f});
//            t.c.forEach(function (d) {
//                return _getVertices(d, {v: t.v, p: t.p});
//            });
//        }
//
//        _getVertices(tree.vis, {});
//        return v.sort(function (a, b) {
//            return a.v - b.v;
//        });
//    },
//
//    getEdges: function () {
//        var e = [];
//
//        function _getEdges(_) {
//            _.c.forEach(function (d) {
//                e.push({v1: _.v, l1: _.l, p1: _.p, v2: d.v, l2: d.l, p2: d.p});
//            });
//            _.c.forEach(_getEdges);
//        }
//
//        _getEdges(tree.vis);
//        return e.sort(function (a, b) {
//            return a.v2 - b.v2;
//        });
//    },
//
//    addLeaf: function (_) {
//        var node = get_node_data('__root__');
//        var c = {v: tree.size++, l: node.name, p: {}, c: []};
//
//        function _addLeaf(t) {
//            if (t.v == _) {
//                t.c.push(c);
//                return;
//            }
//            t.c.forEach(_addLeaf);
//        }
//
//        // ****************************************************
//        _addLeaf(tree.vis);
//        reposition(tree.vis);
//        // ****************************************************
//        if (tree.glabels.length != 0) {
//            tree.glabels = [];
//        }
//
//        tree.redraw();
//    },
//
//    redraw: function () {
//        var edges = d3.select("#g_lines").selectAll('line').data(tree.getEdges());
//
//        edges.transition().duration(500)
//            .attr('x1', function (d) {
//                return d.p1.x;
//            }).attr('y1', function (d) {
//                return d.p1.y;
//            })
//            .attr('x2', function (d) {
//                return d.p2.x;
//            }).attr('y2', function (d) {
//            return d.p2.y;
//        });
//
//        edges.enter().append('line')
//            .attr('x1', function (d) {
//                return d.p1.x;
//            }).attr('y1', function (d) {
//                return d.p1.y;
//            })
//            .attr('x2', function (d) {
//                return d.p1.x;
//            }).attr('y2', function (d) {
//                return d.p1.y;
//            })
//            .transition().duration(500)
//            .attr('x2', function (d) {
//                return d.p2.x;
//            }).attr('y2', function (d) {
//            return d.p2.y;
//        });
//
//        console.log(JSON.stringify(tree.getVertices(), null, 4));
//
//        var circles = d3.select("#g_circles").selectAll('circle').data(tree.getVertices());
//
//        circles.transition().duration(500).attr('cx', function (d) {
//            return d.p.x;
//        }).attr('cy', function (d) {
//            return d.p.y;
//        });
//
//        circles.enter().append('circle').attr('cx', function (d) {
//            return d.f.p.x;
//        }).attr('cy', function (d) {
//            return d.f.p.y;
//        }).attr('r', vRad)
//            .on('click', function (d) {
//                return tree.addLeaf(d.v);
//            })
//            .transition().duration(500).attr('cx', function (d) {
//            return d.p.x;
//        }).attr('cy', function (d) {
//            return d.p.y;
//        });
//
//        //d3.select("#treesvg").append('rect').attr('width', 50).attr('x', function (d) {
//        //    return d.p.x;
//        //}).attr('y', 110);
//
//        var labels = d3.select("#g_labels").selectAll('text').data(tree.getVertices());
//
//        labels.text(function (d) {
//            return d.l;
//        }).transition().duration(500)
//            .attr('x', function (d) {
//                return d.p.x;
//            }).attr('y', function (d) {
//            return d.p.y + 5;
//        });
//
//        labels.enter().append('text').attr('x', function (d) {
//            return d.f.p.x;
//        }).attr('y', function (d) {
//                return d.f.p.y + 5;
//            })
//            .text(function (d) {
//                return d.l;
//            }).on('click', function (d) {
//                return tree.addLeaf(d.v);
//            })
//            .transition().duration(500)
//            .attr('x', function (d) {
//                return d.p.x;
//            }).attr('y', function (d) {
//            return d.p.y + 5;
//        });
//    }
//
//};

function ply_tree(root_node) {
    var vRad = 12, tree = {cx: 800, cy: 30, w: 60, h: 70};
    tree.vis = {v: 0, l: root_node.name, p: {x: tree.cx, y: tree.cy}, c: []};
    tree.size = 1;
    tree.glabels = [];
    tree.incX = 700, tree.incY = 30, tree.incS = 20;

    tree.getVertices = function () {
        var v = [];

        function _getVertices(t, f) {
            v.push({v: t.v, l: t.l, p: t.p, f: f});
            t.c.forEach(function (d) {
                _getVertices(d, {v: t.v, p: t.p});
            });
        }

        _getVertices(tree.vis, {});
        return v.sort(function (a, b) {
            return a.v - b.v;
        });
    };

    tree.getEdges = function () {
        var e = [];

        function _getEdges(_) {
            _.c.forEach(function (d) {
                e.push({v1: _.v, l1: _.l, p1: _.p, v2: d.v, l2: d.l, p2: d.p});
            });
            _.c.forEach(_getEdges);
        }

        _getEdges(tree.vis);
        return e.sort(function (a, b) {
            return a.v2 - b.v2;
        });
    };

    tree.addLeaf = function (_) {
        var node = get_node_data('__root__');
        var c = {v: tree.size++, l: node.name, p: {}, c: []};

        function _addLeaf(t) {
            if (t.v == _) {
                t.c.push(c);
                return;
            }
            t.c.forEach(_addLeaf);
        }

        // ****************************************************
        _addLeaf(tree.vis);
        reposition(tree.vis);
        // ****************************************************
        if (tree.glabels.length != 0) {
            tree.glabels = [];
        }

        redraw();
    };

    redraw = function () {
        var edges = d3.select("#g_lines").selectAll('line').data(tree.getEdges());

        edges.transition().duration(500)
            .attr('x1', function (d) {
                return d.p1.x;
            }).attr('y1', function (d) {
                return d.p1.y;
            })
            .attr('x2', function (d) {
                return d.p2.x;
            }).attr('y2', function (d) {
            return d.p2.y;
        });

        edges.enter().append('line')
            .attr('x1', function (d) {
                return d.p1.x;
            }).attr('y1', function (d) {
                return d.p1.y;
            })
            .attr('x2', function (d) {
                return d.p1.x;
            }).attr('y2', function (d) {
                return d.p1.y;
            })
            .transition().duration(500)
            .attr('x2', function (d) {
                return d.p2.x;
            }).attr('y2', function (d) {
            return d.p2.y;
        });

        console.log(JSON.stringify(tree.getVertices(), null, 4));

        var circles = d3.select("#g_circles").selectAll('circle').data(tree.getVertices());

        circles.transition().duration(500).attr('cx', function (d) {
            return d.p.x;
        }).attr('cy', function (d) {
            return d.p.y;
        });

        circles.enter().append('circle').attr('cx', function (d) {
            return d.f.p.x;
        }).attr('cy', function (d) {
            return d.f.p.y;
        }).attr('r', vRad)
            .on('click', function (d) {
                return tree.addLeaf(d.v);
            })
            .transition().duration(500).attr('cx', function (d) {
            return d.p.x;
        }).attr('cy', function (d) {
            return d.p.y;
        });

        //d3.select("#treesvg").append('rect').attr('width', 50).attr('x', function (d) {
        //    return d.p.x;
        //}).attr('y', 110);

        var labels = d3.select("#g_labels").selectAll('text').data(tree.getVertices());

        labels.text(function (d) {
            return d.l;
        }).transition().duration(500)
            .attr('x', function (d) {
                return d.p.x;
            }).attr('y', function (d) {
            return d.p.y + 5;
        });

        labels.enter().append('text').attr('x', function (d) {
            return d.f.p.x;
        }).attr('y', function (d) {
                return d.f.p.y + 5;
            })
            .text(function (d) {
                return d.l;
            }).on('click', function (d) {
                return tree.addLeaf(d.v);
            })
            .transition().duration(500)
            .attr('x', function (d) {
                return d.p.x;
            }).attr('y', function (d) {
            return d.p.y + 5;
        });
    };

    getLeafCount = function (_) {
        if (_.c.length == 0) return 1;
        else return _.c.map(getLeafCount).reduce(function (a, b) {
            return a + b;
        });
    };

    reposition = function (v) {
        var lC = getLeafCount(v), left = v.p.x - tree.w * (lC - 1) / 2;
        v.c.forEach(function (d) {
            var w = tree.w * getLeafCount(d);
            left += w;
            d.p = {x: left - (w + tree.w) / 2, y: v.p.y + tree.h};
            reposition(d);
        });
    };

    function initialize() {

        d3.select("#treesvg").append('g').attr('id', 'g_circles').selectAll('circle').data(tree.getVertices()).enter()
            .append('circle').attr('r', vRad)
            .on('click', function (d) {
                return tree.addLeaf(d.v);
            });

        //d3.select("#treesvg").append('rect').attr('width', 50).attr('x', 600).attr('y', 100);
        //d3.select("#treesvg").append('g').attr('id', 'g_rects').selectAll('rect').data(tree.getVertices()).enter()
        //    .append('rect').attr('cx', function (d) {
        //    return d.p.x;
        //})  .attr('cy', function (d) {
        //    return d.p.y;
        //}).attr('width', vRad).attr('height', vRad)

        //var aaa = [{
        //    "v": 0,
        //    "l": root_node.name,
        //    "p": {
        //        "x": 800,
        //        "y": 30
        //    },
        //    "f": {}
        //}];
        ////

        d3.select("#treesvg").append('g').attr('id', 'g_labels').selectAll('text').data(tree.getVertices()).enter()
            .append('text')
            .on('click', function (d) {
                return tree.addLeaf(d.v);
            });

        //tree.addLeaf(0);
        tree.addLeaf(0);
        tree.addLeaf(0);
        //redraw();

    };

    initialize(root_node);

    return tree;
}

function do_load() {
    var root_node = get_node_data('__root__');
    console.log(JSON.stringify(root_node, null, 4));
    var ply = ply_tree(root_node);
    //var ply = Tree.createNew(root_node);
}


//ply.js:113 [
//    {
//        "v": 0,
//        "l": "root",
//        "p": {
//            "x": 800,
//            "y": 30
//        },
//        "f": {}
//    },
//    {
//        "v": 1,
//        "l": "node",
//        "p": {
//            "x": 770,
//            "y": 100
//        },
//        "f": {
//            "v": 0,
//            "p": {
//                "x": 800,
//                "y": 30
//            }
//        }
//    },
//    {
//        "v": 2,
//        "l": "node",
//        "p": {
//            "x": 830,
//            "y": 100
//        },
//        "f": {
//            "v": 0,
//            "p": {
//                "x": 800,
//                "y": 30
//            }
//        }
//    }
//]





//
//
//var ply_st;
//
//var Log = {
//    elem: false,
//    write: function (text) {
//        if (!this.elem)
//            this.elem = document.getElementById('message');
//        this.elem.innerHTML = text;
//        this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
//    }
//};
//
//
//function get_node_data(node_name) {
//    var data = null;
//    $.ajax({
//        url: '/ply?node=' + node_name,
//        type: 'GET',
//        async: false,
//        dataType: 'json',
//        timeout: 3000,
//        success: function (_data, textStatus, jqXHR) {
//            data = _data;
//        },
//        error: function (xhr, status, error) {
//            alert('Can not access API [ /ply?node=xxx ]');
//            return;
//        }
//    });
//    return data;
//}
//
//function load_node(nodeId, level, onComplete) {
//    onComplete.onComplete(nodeId, get_node_data('__root__'));
//    ply_st.graph.eachNode(function (n) {
//        //console.log('aaa' + n.data.n_width);
//        n.setData('width', n.data.n_width, 'end');
//        n.setDataset('end', {
//            width: n.data.n_width,
//            height: 20
//        });
//    });
//}
//
//$(document).ready(function () {
//    $('#container').height(window.innerHeight);
//    init_ply();
//});
//
//
//function init_ply() {
//    //Implement a node rendering function called 'nodeline' that plots a straight line
//    //when contracting or expanding a subtree.
//    $jit.ST.Plot.NodeTypes.implement({
//        'nodeline': {
//            'render': function (node, canvas, animating) {
//
//
//                console.log('bbb' + node.data.n_width);
//                var width = node.data.n_width,
//                    height = node.getData('height'),
//                    pos = this.getAlignedPos(node.pos.getc(true), width, height),
//                    posX = pos.x + width / 2,
//                    posY = pos.y + height / 2;
//                this.nodeHelper.rectangle.render('fill', {x: posX, y: posY}, width, height, canvas);
//                this.nodeHelper.rectangle.render('stroke', {x: posX, y: posY}, width, height, canvas);
//
//
//                if (animating === 'expand' || animating === 'contract') {
//                    var pos = node.pos.getc(true), nconfig = this.node, data = node.data;
//                    var width = nconfig.width, height = nconfig.height;
//                    var algnPos = this.getAlignedPos(pos, width, height);
//                    var ctx = canvas.getCtx(), ort = this.config.orientation;
//                    ctx.beginPath();
//
//                    //posX = algnPos.x + width / 2,
//                    //posY = algnPos.y + height / 2;
//                    posX = pos.x + width / 2 + 500,
//                    posY = pos.y + height / 2 + 500;
//                    console.log(posX, posY);
//                    if (ort == 'left' || ort == 'right') {
//                        ctx.moveTo(posX, posY + height / 2);
//                        ctx.lineTo(posX + width, posY + height / 2);
//                    } else {
//                        ctx.moveTo(posX + width / 2, posY);
//                        ctx.lineTo(posX + width / 2, posY + height);
//                    }
//                    ctx.stroke();
//                }
//
//            }
//        }
//
//    });
//
//    //init Spacetree
//    //Create a new ST instance
//    ply_st = new $jit.ST({
//        'injectInto': 'container',
//        //set duration for the animation
//        duration: 400,
//
//        orientation: 'top',
//        //set animation transition type
//        transition: $jit.Trans.Quart.easeInOut,
//        //set distance between node and its children
//        levelDistance: 50,
//        //set max levels to show. Useful when used with
//        //the request method for requesting trees of specific depth
//        levelsToShow: 2,
//        //set node and edge styles
//        Node: {
//            height: 20,
//            width: 40,
//            type: 'nodeline',
//            color: '#23A4FF',
//            lineWidth: 2,
//            align: "center",
//            overridable: true           //set overridable=true for styling individual
//        },
//        Edge: {
//            type: 'bezier',
//            lineWidth: 2,
//            color: '#23A4FF',
//            overridable: true           //set overridable=true for styling individual
//        },
//        //Add a request method for requesting on-demand json trees.
//        //This method gets called when a node
//        //is clicked and its subtree has a smaller depth
//        //than the one specified by the levelsToShow parameter.
//        //In that case a subtree is requested and is added to the dataset.
//        //This method is asynchronous, so you can make an Ajax request for that
//        //subtree and then handle it to the onComplete callback.
//        //Here we just use a client-side tree generator (the getTree function).
//        request: load_node,
//
//        onBeforeCompute: function (node) {
//            Log.write("loading ...");
//            //console.log(node.data.n_width);
//            //node.setData('width', node.data.n_width + 'px');
//            //node.setData('width', 200);
//        },
//
//        onAfterCompute: function () {
//            Log.write("");
//        },
//
//        //This method is called on DOM label creation.
//        //Use this method to add event handlers and styles to
//        //your node.
//        onCreateLabel: function (label, node) {
//            label.id = node.id;
//            label.innerHTML = node.name;
//            label.onclick = function () {
//                ply_st.onClick(node.id);
//            };
//            //set label styles
//            var style = label.style;
//            style.width = node.data.n_width + 'px';
//            style.height = 17 + 'px';
//            style.cursor = 'pointer';
//            style.color = '#fff';
//            //style.backgroundColor = '#1a1a1a';
//            style.fontSize = '0.8em';
//            style.textAlign = 'center';
//            style.textDecoration = 'underline';
//            style.paddingTop = '3px';
//        },
//
//        //This method is called right before plotting
//        //a node. It's useful for changing an individual node
//        //style properties before plotting it.
//        //The data properties prefixed with a dollar
//        //sign will override the global node style properties.
//        onBeforePlotNode: function (node) {
//            //node.setData('width', 200);
//            //add some color to the nodes in the path between the
//            //root node and the selected node.
//            if (node.selected) {
//                node.data.$color = "#ff7";
//            }
//            else {
//                delete node.data.$color;
//            }
//        },
//
//        //This method is called right before plotting
//        //an edge. It's useful for changing an individual edge
//        //style properties before plotting it.
//        //Edge data proprties prefixed with a dollar sign will
//        //override the Edge global style properties.
//        onBeforePlotLine: function (adj) {
//            if (adj.nodeFrom.selected && adj.nodeTo.selected) {
//                adj.data.$color = "#eed";
//                adj.data.$lineWidth = 3;
//            }
//            else {
//                delete adj.data.$color;
//                delete adj.data.$lineWidth;
//            }
//        },
//
//        onPlaceLabel: function (label, node) {
//            var style = label.style;
//            style.width = node.data.n_width + 'px';
//        }
//    });
//    //load json data
//    var json_data = {
//        id: 'node02', name: '0.2', data: {}, children: [
//            {id: 'node021', name: '0.21', data: {}, children: []},
//            {id: 'node022', name: '0.22', data: {}, children: []},
//            {id: 'node023', name: '0.23', data: {}, children: [{id: 'node0223', name: '0.23', data: {}, children: []}]},
//        ]
//    };
//    ply_st.loadJSON(get_node_data('__root__'));
//    //compute node positions and layout
//    ply_st.compute();
//    //emulate a click on the root node.
//    ply_st.onClick(ply_st.root);
//    //end
//    //Add event handlers to switch spacetree orientation.
//    function get(id) {
//        return document.getElementById(id);
//    };
//    ply_st.graph.eachNode(function (n) {
//        n.setData('width', n.data.n_width, 'end');
//        n.setDataset('end', {
//            width: n.data.n_width,
//            height: 20
//        });
//    });
//}
