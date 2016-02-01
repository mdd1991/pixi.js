var Shader = require('pixi-gl-core').GLShader;
var extractUniformsFromSrc = require('./extractUniformsFromSrc')

/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 * @param shaderManager {PIXI.ShaderManager} The webgl shader manager this shader works for.
 * @param [vertexSrc] {string} The source of the vertex shader.
 * @param [fragmentSrc] {string} The source of the fragment shader.
 * @param [customUniforms] {object} Custom uniforms to use to augment the built-in ones.
 * @param [fragmentSrc] {string} The source of the fragment shader.
 */
function Filter(vertexSrc, fragmentSrc, uniforms)
{
   
    /**
     * The vertex shader.
     *
     * @member {string}
     */
    this.vertexSrc = vertexSrc || Filter.defaultVertexSrc;

    /**
     * The fragment shader.
     *
     * @member {string}
     */
    this.fragmentSrc = fragmentSrc || Filter.defaultFragmentSrc;

    // pull out the vertex and shader uniforms if they are not specified..
    // currently this does not extract structs only default types
    this.uniformData = uniforms || extractUniformsFromSrc( this.vertexSrc, this.fragmentSrc, 'projectionMatrix|uSampler');
    
    this.uniforms = {};
 
    for (var i in this.uniformData) 
    {
        this.uniforms[i] = this.uniformData[i].value;
    };

    // this.uniforms = 
    // this is where we store shader references..
    // TODO we could cache this!
    this.glShaders = [];
}

// constructor
Filter.prototype.constructor = Filter;
module.exports = Filter;

Filter.prototype.apply = function(filterManager, input, output, clear)
{
    // --- //
    
    // do as you please!

    filterManager.applyFilter(this, input, output, clear);

    /////////
}

/**
 * The default vertex shader source
 *
 * @static
 * @constant
 */
Filter.defaultVertexSrc = [
    'precision lowp float;',
    'attribute vec2 aVertexPosition;',
    'attribute vec2 aTextureCoord;',

    'uniform mat3 projectionMatrix;',
    'uniform mat3 filterMatrix;',
    'varying vec2 vTextureCoord;',
    'varying vec2 vFilterCoord;',

    'void main(void){',
    '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
    '   vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;',
    '   vTextureCoord = aTextureCoord ;',
    '}'
].join('\n');

/**
 * The default fragment shader source
 *
 * @static
 * @constant
 */
Filter.defaultFragmentSrc = [
    'precision lowp float;',

    'varying vec2 vTextureCoord;',
    'varying vec2 vFilterCoord;',

    'uniform sampler2D uSampler;',
    'uniform sampler2D filterSampler;',

    'void main(void){',
    '   vec4 masky = texture2D(filterSampler, vFilterCoord);',
    '   vec4 sample = texture2D(uSampler, vTextureCoord);',
    '   vec4 color;',
    '   if(mod(vFilterCoord.x, 1.0) > 0.5)',
    '   {',
    '     color = vec4(1.0, 0.0, 0.0, 1.0);',
    '   }',
    '   else',
    '   {',
    '     color = vec4(0.0, 1.0, 0.0, 1.0);',
    '   }',
   // '   gl_FragColor = vec4(mod(vFilterCoord.x, 1.5), vFilterCoord.y,0.0,1.0);',
    '   gl_FragColor = mix(sample, masky, 0.5);',
    '   gl_FragColor *= sample.a;',
    '}'
].join('\n');
