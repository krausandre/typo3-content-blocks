/* eslint-env node, commonjs */
/* eslint-disable @typescript-eslint/no-var-requires */

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

module.exports = function (grunt) {

  const sass = require('sass');
  const esModuleLexer = require('es-module-lexer');

  /**
   * Grunt stylefmt task
   */
  grunt.registerMultiTask('formatsass', 'Grunt task for stylefmt', function () {
    let done = this.async(),
      stylefmt = require('@ronilaukkarinen/stylefmt'),
      postcss = require('postcss'),
      scss = require('postcss-scss'),
      files = this.filesSrc.filter(function (file) {
        return grunt.file.isFile(file);
      }),
      counter = 0;
    this.files.forEach(function (file) {
      file.src.filter(function (filepath) {
        let content = grunt.file.read(filepath);
        let settings = {
          from: filepath,
          syntax: scss
        };
        postcss([stylefmt]).process(content, settings).then(function (result) {
          grunt.file.write(file.dest, result.css);
          grunt.log.success('Source file "' + filepath + '" was processed.');
          counter++;
          if (counter >= files.length) {
            done(true);
          }
        });
      });
    });
  });

  /**
   * Grunt flag tasks
   */
  grunt.registerMultiTask('flags', 'Grunt task rendering the flags', function () {
    let done = this.async(),
      path = require('path'),
      sharp = require('sharp'),
      filesize = require('filesize'),
      files = this.filesSrc.filter(function (file) {
        return grunt.file.isFile(file);
      }),
      counter = 0;
    this.files.forEach(function (file) {
      file.src.filter(function (filepath) {
        const targetFilename = path.join(file.orig.dest, file.dest.substring(file.orig.dest.length, file.dest.length - 4) + '.webp');
        const overlay = Buffer.from('<svg width="32" height="32">	<path opacity="0.15" d="M30,6v20H2V6H30 M32,4H0v24h32V4L32,4z"/></svg>');
        sharp(filepath)
          .webp()
          .flatten({ background: '#ffffff' })
          .resize(32, 32, {
            fit: 'contain',
            position: 'center',
            background: 'transparent',
          })
          .composite([{ input: overlay }])
          .toFile(targetFilename)
          .then(data => {
            grunt.log.ok(`File ${targetFilename} created. ${filesize.filesize(data.size)}`)
            counter++;
            if (counter >= files.length) {
              done(true);
            }
          }).catch(function (err) {
            grunt.log.error('File "' + targetFilename + '" was not processed.');
            console.log(err)
          });
      });
    });
  });
  grunt.registerTask('flags-clear', function () {
    const path = '../typo3/sysext/core/Resources/Public/Icons/Flags';
    grunt.file.delete(path, { force: true });
    grunt.file.mkdir(path);
    grunt.log.ok(`Cleared ${path}.`)
  });
  grunt.registerTask('flags-build', ['flags-clear', 'flags']);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    paths: {
      sources: 'Sources/',
      root: '../',
      sass: '<%= paths.sources %>Sass/',
      typescript: '<%= paths.sources %>TypeScript/',
      sysext: '<%= paths.root %>typo3/sysext/',
      form: '<%= paths.sysext %>form/Resources/',
      dashboard: '<%= paths.sysext %>dashboard/Resources/',
      frontend: '<%= paths.sysext %>frontend/Resources/',
      adminpanel: '<%= paths.sysext %>adminpanel/Resources/',
      install: '<%= paths.sysext %>install/Resources/',
      linkvalidator: '<%= paths.sysext %>linkvalidator/Resources/',
      backend: '<%= paths.sysext %>backend/Resources/',
      content_blocks: '<%= paths.sysext %>content_blocks/Resources/',
      t3editor: '<%= paths.sysext %>t3editor/Resources/',
      workspaces: '<%= paths.sysext %>workspaces/Resources/',
      ckeditor: '<%= paths.sysext %>rte_ckeditor/Resources/',
      core: '<%= paths.sysext %>core/Resources/',
      node_modules: 'node_modules/',
      t3icons: '<%= paths.node_modules %>@typo3/icons/dist/'
    },
    flags: {
      flagIcons: {
        files: [{
          expand: true,
          cwd: '<%= paths.node_modules %>flag-icons/flags/4x3',
          // Excludes
          // - cp: Clipperton
          // - dg: Diego Garcia
          // - cefta: Central European Free Trade Agreement
          // - ta: Tristan da Cunha
          // - un: United Nations
          // - um: United States Minor Outlying Islands
          // - xx: Placeholder
          src: ['**/*.svg', '!cp.svg', '!dg.svg', '!cefta.svg', '!ta.svg', '!um.svg', '!un.svg', '!xx.svg'],
          dest: '<%= paths.core %>/Public/Icons/Flags'
        }]
      },
      overrides: {
        files: [{
          expand: true,
          cwd: '<%= paths.sources %>Icons/Flags',
          src: ['**/*.svg'],
          dest: '<%= paths.core %>/Public/Icons/Flags'
        }]
      },
    },
    stylelint: {
      options: {
        configFile: '<%= paths.root %>/Build/.stylelintrc',
      },
      sass: ['<%= paths.sass %>**/*.scss']
    },
    formatsass: {
      sass: {
        files: [{
          expand: true,
          cwd: '<%= paths.sass %>',
          src: ['**/*.scss'],
          dest: '<%= paths.sass %>'
        }]
      }
    },
    sass: {
      options: {
        implementation: sass,
        outputStyle: 'expanded',
        precision: 8
      },
      backend: {
        files: {
          '<%= paths.backend %>Public/Css/backend.css': '<%= paths.sass %>backend.scss'
        }
      },
      content_blocks: {
        files: {
          "<%= paths.content_blocks %>Public/Css/content_blocks.css": "<%= paths.sass %>content_blocks.scss"
        }
      },
      form: {
        files: {
          '<%= paths.form %>Public/Css/form.css': '<%= paths.sass %>form.scss'
        }
      },
      dashboard: {
        files: {
          '<%= paths.dashboard %>Public/Css/dashboard.css': '<%= paths.sass %>dashboard.scss'
        }
      },
      dashboard_modal: {
        files: {
          '<%= paths.dashboard %>Public/Css/Modal/style.css': '<%= paths.sass %>dashboard_modal.scss'
        }
      },
      adminpanel: {
        files: {
          '<%= paths.adminpanel %>Public/Css/adminpanel.css': '<%= paths.sass %>adminpanel.scss'
        }
      },
      webfonts: {
        files: {
          '<%= paths.backend %>Public/Css/webfonts.css': '<%= paths.sass %>webfonts.scss'
        }
      },
      workspaces: {
        files: {
          '<%= paths.workspaces %>Public/Css/preview.css': '<%= paths.sass %>workspace.scss'
        }
      }
    },
    postcss: {
      options: {
        map: false,
        processors: [
          require('autoprefixer')(),
          require('postcss-clean')({
            rebase: false,
            level: {
              1: {
                specialComments: 0
              }
            }
          }),
          require('postcss-banner')({
            banner: 'This file is part of the TYPO3 CMS project.\n' +
              '\n' +
              'It is free software; you can redistribute it and/or modify it under\n' +
              'the terms of the GNU General Public License, either version 2\n' +
              'of the License, or any later version.\n' +
              '\n' +
              'For the full copyright and license information, please read the\n' +
              'LICENSE.txt file that was distributed with this source code.\n' +
              '\n' +
              'The TYPO3 project - inspiring people to share!',
            important: true,
            inline: false
          })
        ]
      },
      adminpanel: {
        src: '<%= paths.adminpanel %>Public/Css/*.css'
      },
      backend: {
        src: '<%= paths.backend %>Public/Css/*.css'
      },
      content_blocks: {
        src: '<%= paths.content_blocks %>Public/Css/*.css'
      },
      core: {
        src: '<%= paths.core %>Public/Css/*.css'
      },
      dashboard: {
        src: '<%= paths.dashboard %>Public/Css/*.css'
      },
      dashboard_modal: {
        src: '<%= paths.dashboard %>Public/Css/Modal/*.css'
      },
      form: {
        src: '<%= paths.form %>Public/Css/*.css'
      },
      linkvalidator: {
        src: '<%= paths.linkvalidator %>Public/Css/*.css'
      },
      t3editor: {
        src: '<%= paths.t3editor %>Public/Css/**/*.css'
      },
      workspaces: {
        src: '<%= paths.workspaces %>Public/Css/*.css'
      }
    },
    exec: {
      ts: ((process.platform === 'win32') ? 'node_modules\\.bin\\tsc.cmd' : './node_modules/.bin/tsc') + ' --project tsconfig.json',
      ckeditor: ((process.platform === 'win32') ? 'node_modules\\.bin\\rollup.cmd' : './node_modules/.bin/rollup') + ' -c ckeditor5.rollup.config.js',
      lintspaces: ((process.platform === 'win32') ? 'node_modules\\.bin\\lintspaces.cmd' : './node_modules/.bin/lintspaces') + ' --editorconfig ../.editorconfig "../typo3/sysext/*/Resources/Private/**/*.html"',
      'npm-install': 'npm install'
    },
    eslint: {
      options: {
        cache: true,
        cacheLocation: './.cache/eslintcache/',
        overrideConfigFile: '.eslintrc.json'
      },
      files: {
        src: [
          '<%= paths.typescript %>/**/*.ts',
          './types/**/*.ts'
        ]
      }
    },
    watch: {
      options: {
        livereload: true
      },
      sass: {
        files: '<%= paths.sass %>**/*.scss',
        tasks: ['css', 'bell']
      },
      ts: {
        files: '<%= paths.typescript %>/**/*.ts',
        tasks: ['scripts', 'bell']
      }
    },
    copy: {
      options: {
        punctuation: ''
      },
      ts_files: {
        options: {
          process: (source, srcpath) => {
            const [imports] = esModuleLexer.parse(source, srcpath);

            source = require('./util/map-import.js').mapImports(source, srcpath, imports);

            // Workaround for https://github.com/microsoft/TypeScript/issues/35802 to avoid
            // rollup from complaining in karma/jsunit test setup:
            //   The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten
            source = source.replace('__decorate=this&&this.__decorate||function', '__decorate=function');

            return source;
          }
        },
        files: [{
          expand: true,
          cwd: '<%= paths.root %>Build/JavaScript/',
          src: ['**/*.js', '**/*.js.map'],
          dest: '<%= paths.sysext %>',
          rename: (dest, src) => dest + src
            .replace('/', '/Resources/Public/JavaScript/')
            .replace('/Resources/Public/JavaScript/tests/', '/Tests/JavaScript/')
        }]
      },
      core_icons: {
        files: [{
          expand: true,
          cwd: '<%= paths.t3icons %>',
          src: ['**/*.svg', 'icons.json', '!install/*', '!module/*'],
          dest: '<%= paths.sysext %>core/Resources/Public/Icons/T3Icons/',
        }]
      },
      install_icons: {
        files: [
          {
            expand: true,
            cwd: '<%= paths.t3icons %>svgs/install/',
            src: ['**/*.svg'],
            dest: '<%= paths.sysext %>install/Resources/Public/Icons/modules/',
          }
        ]
      },
      module_icons: {
        files: [
          {
            dest: '<%= paths.sysext %>adminpanel/Resources/Public/Icons/module-adminpanel.svg',
            src: '<%= paths.t3icons %>svgs/module/module-adminpanel.svg'
          },
          {
            dest: '<%= paths.sysext %>install/Resources/Public/Icons/module-install.svg',
            src: '<%= paths.t3icons %>svgs/module/module-install.svg'
          },
          {
            dest: '<%= paths.sysext %>install/Resources/Public/Icons/module-install-environment.svg',
            src: '<%= paths.t3icons %>svgs/module/module-install-environment.svg'
          },
          {
            dest: '<%= paths.sysext %>install/Resources/Public/Icons/module-install-maintenance.svg',
            src: '<%= paths.t3icons %>svgs/module/module-install-maintenance.svg'
          },
          {
            dest: '<%= paths.sysext %>install/Resources/Public/Icons/module-install-settings.svg',
            src: '<%= paths.t3icons %>svgs/module/module-install-settings.svg'
          },
          {
            dest: '<%= paths.sysext %>install/Resources/Public/Icons/module-install-upgrade.svg',
            src: '<%= paths.t3icons %>svgs/module/module-install-upgrade.svg'
          }
        ]
      },
      extension_icons: {
        files: [
          {
            dest: '<%= paths.sysext %>form/Resources/Public/Icons/Extension.svg',
            src: '<%= paths.t3icons %>svgs/module/module-form.svg'
          },
          {
            dest: '<%= paths.sysext %>reactions/Resources/Public/Icons/Extension.svg',
            src: '<%= paths.t3icons %>svgs/module/module-reactions.svg'
          },
          {
            dest: '<%= paths.sysext %>rte_ckeditor/Resources/Public/Icons/Extension.svg',
            src: '<%= paths.t3icons %>svgs/module/module-rte-ckeditor.svg'
          },
          {
            dest: '<%= paths.sysext %>linkvalidator/Resources/Public/Icons/Extension.svg',
            src: '<%= paths.t3icons %>svgs/module/module-linkvalidator.svg'
          }
        ]
      },
      fonts: {
        files: [
          {
            expand: true,
            cwd: '<%= paths.node_modules %>source-sans/WOFF2/VAR/',
            src: ['*.otf.woff2'],
            dest: '<%= paths.sysext %>backend/Resources/Public/Fonts/SourceSans'
          }
        ]
      },
      lit: {
        options: {
          process: (content) => content.replace(/\/\/# sourceMappingURL=[^ ]+/, '')
        },
        files: [{
          expand: true,
          cwd: '<%= paths.node_modules %>',
          dest: '<%= paths.core %>Public/JavaScript/Contrib/',
          src: [
            'lit/*.js',
            'lit/decorators/*.js',
            'lit/directives/*.js',
            'lit-html/*.js',
            'lit-html/directives/*.js',
            'lit-element/*.js',
            'lit-element/decorators/*.js',
            '@lit/reactive-element/*.js',
            '@lit/reactive-element/decorators/*.js',
          ],
        }]
      },
      t3editor: {
        files: [
          {
            expand: true,
            cwd: '<%= paths.node_modules %>@codemirror',
            dest: '<%= paths.t3editor %>Public/JavaScript/Contrib/@codemirror/',
            rename: (dest, src) => dest + src.replace('/dist/index', ''),
            src: ['*/dist/index.js']
          },
          {
            expand: true,
            cwd: '<%= paths.node_modules %>@lezer',
            dest: '<%= paths.t3editor %>Public/JavaScript/Contrib/@lezer/',
            rename: (dest, src) => dest + src.replace('/dist/index.es', ''),
            src: ['*/dist/index.es.js']
          },
          {
            src: '<%= paths.node_modules %>@lezer/lr/dist/index.js',
            dest: '<%= paths.t3editor %>Public/JavaScript/Contrib/@lezer/lr.js'
          },
          {
            src: '<%= paths.node_modules %>crelt/index.es.js',
            dest: '<%= paths.t3editor %>Public/JavaScript/Contrib/crelt.js'
          },
          {
            src: '<%= paths.node_modules %>style-mod/src/style-mod.js',
            dest: '<%= paths.t3editor %>Public/JavaScript/Contrib/style-mod.js'
          },
          {
            src: '<%= paths.node_modules %>w3c-keyname/index.es.js',
            dest: '<%= paths.t3editor %>Public/JavaScript/Contrib/w3c-keyname.js'
          },
        ]
      }
    },
    clean: {
      lit: {
        options: {
          'force': true
        },
        src: [
          '<%= paths.core %>Public/JavaScript/Contrib/lit',
          '<%= paths.core %>Public/JavaScript/Contrib/lit-html',
          '<%= paths.core %>Public/JavaScript/Contrib/lit-element',
          '<%= paths.core %>Public/JavaScript/Contrib/@lit/reactive-element',
        ]
      }
    },
    newer: {
      options: {
        cache: './.cache/grunt-newer/'
      }
    },
    rollup: {
      options: {
        format: 'esm',
        entryFileNames: '[name].js'
      },
      'd3-selection': {
        options: {
          preserveModules: false,
          plugins: () => [
            {
              name: 'terser',
              renderChunk: code => require('terser').minify(code, grunt.config.get('terser.options'))
            }
          ]
        },
        files: {
          '<%= paths.core %>Public/JavaScript/Contrib/d3-selection.js': [
            'node_modules/d3-selection/src/index.js'
          ]
        }
      },
      'd3-dispatch': {
        options: {
          preserveModules: false,
          plugins: () => [
            {
              name: 'terser',
              renderChunk: code => require('terser').minify(code, grunt.config.get('terser.options'))
            }
          ]
        },
        files: {
          '<%= paths.core %>Public/JavaScript/Contrib/d3-dispatch.js': [
            'node_modules/d3-dispatch/src/index.js'
          ]
        }
      },
      'd3-drag': {
        options: {
          preserveModules: false,
          plugins: () => [
            {
              name: 'terser',
              renderChunk: code => require('terser').minify(code, grunt.config.get('terser.options'))
            },
            {
              name: 'externals',
              resolveId: (source) => {
                if (source === 'd3-selection') {
                  return { id: 'd3-selection', external: true }
                }
                if (source === 'd3-dispatch') {
                  return { id: 'd3-dispatch', external: true }
                }
                return null
              }
            }
          ]
        },
        files: {
          '<%= paths.core %>Public/JavaScript/Contrib/d3-drag.js': [
            'node_modules/d3-drag/src/index.js'
          ]
        }
      },
      'bootstrap': {
        options: {
          preserveModules: false,
          plugins: () => [
            {
              name: 'terser',
              renderChunk: code => require('terser').minify(code, grunt.config.get('terser.options'))
            },
            {
              name: 'externals',
              resolveId: (source) => {
                if (source === 'jquery') {
                  return { id: 'jquery', external: true }
                }
                if (source === 'bootstrap') {
                  return { id: 'node_modules/bootstrap/dist/js/bootstrap.esm.js' }
                }
                if (source === '@popperjs/core') {
                  return { id: 'node_modules/@popperjs/core/dist/esm/index.js' }
                }
                return null
              }
            }
          ]
        },
        files: {
          '<%= paths.core %>Public/JavaScript/Contrib/bootstrap.js': [
            'Sources/JavaScript/core/Resources/Public/JavaScript/Contrib/bootstrap.js'
          ]
        }
      }
    },
    npmcopy: {
      options: {
        clean: false,
        report: false,
        srcPrefix: 'node_modules/'
      },
      backend: {
        options: {
          destPrefix: '<%= paths.backend %>Public',
          copyOptions: {
            process: (source, srcpath) => {
              if (srcpath.match(/.*\.js$/)) {
                return require('./util/cjs-to-esm.js').cjsToEsm(source);
              }

              return source;
            }
          }
        },
        files: {
          'JavaScript/Contrib/mark.js': 'mark.js/dist/mark.es6.min.js'
        }
      },
      dashboardToEs6: {
        options: {
          destPrefix: '<%= paths.dashboard %>Public',
          copyOptions: {
            process: (source, srcpath) => {
              if (srcpath.match(/.*\.js$/)) {
                return require('./util/cjs-to-esm.js').cjsToEsm(source);
              }

              return source;
            }
          }
        },
        files: {
          'JavaScript/Contrib/muuri.js': 'muuri/dist/muuri.min.js'
        }
      },
      dashboard: {
        options: {
          destPrefix: '<%= paths.dashboard %>Public',
        },
        files: {
          'JavaScript/Contrib/chartjs.js': 'chart.js/dist/chart.js',
          'JavaScript/Contrib/chunks/helpers.segment.js': 'chart.js/dist/chunks/helpers.segment.js'
        }
      },
      umdToEs6: {
        options: {
          destPrefix: '<%= paths.core %>Public/JavaScript/Contrib',
          copyOptions: {
            process: (source, srcpath) => {
              let imports = [], prefix = '';

              if (srcpath === 'node_modules/@claviska/jquery-minicolors/jquery.minicolors.min.js') {
                imports.push('jquery');
              }

              if (srcpath === 'node_modules/tablesort/dist/sorts/tablesort.dotsep.min.js') {
                prefix = 'import Tablesort from "tablesort";';
              }

              if (srcpath === 'node_modules/tablesort/dist/sorts/tablesort.number.min.js') {
                prefix = 'import Tablesort from "tablesort";';
              }

              return require('./util/cjs-to-esm.js').cjsToEsm(source, imports, prefix);
            }
          }
        },
        files: {
          'broadcastchannel.js': 'broadcastchannel-polyfill/index.js',
          'flatpickr/flatpickr.min.js': 'flatpickr/dist/flatpickr.js',
          'flatpickr/locales.js': 'flatpickr/dist/l10n/index.js',
          'interact.js': 'interactjs/dist/interact.min.js',
          'jquery.js': 'jquery/dist/jquery.js',
          'jquery/minicolors.js': '../node_modules/@claviska/jquery-minicolors/jquery.minicolors.min.js',
          'nprogress.js': 'nprogress/nprogress.js',
          'sortablejs.js': 'sortablejs/dist/sortable.umd.js',
          'tablesort.js': 'tablesort/dist/tablesort.min.js',
          'tablesort.dotsep.js': 'tablesort/dist/sorts/tablesort.dotsep.min.js',
          'tablesort.number.js': 'tablesort/dist/sorts/tablesort.number.min.js',
          'taboverride.js': 'taboverride/build/output/taboverride.js',
        }
      },
      install: {
        options: {
          destPrefix: '<%= paths.install %>Public/JavaScript',
          copyOptions: {
            process: (source, srcpath) => {
              if (srcpath === 'node_modules/chosen-js/chosen.jquery.js') {
                source = 'import jQuery from \'jquery\';\n' + source;
              }

              return source;
            }
          }
        },
        files: {
          'chosen.jquery.min.js': 'chosen-js/chosen.jquery.js',
        }
      },
      jqueryUi: {
        options: {
          destPrefix: '<%= paths.core %>Public/JavaScript/Contrib',
          copyOptions: {
            process: (source, srcpath) => {

              const imports = {
                core: [],
                draggable: ['core', 'mouse', 'widget'],
                droppable: ['core', 'widget', 'mouse', 'draggable'],
                mouse: ['widget'],
                position: [],
                resizable: ['core', 'mouse', 'widget'],
                selectable: ['core', 'mouse', 'widget'],
                sortable: ['core', 'mouse', 'widget'],
                widget: []
              };

              const moduleName = require('path').basename(srcpath, '.js');

              const code = [
                'import jQuery from "jquery";',
              ];

              if (moduleName in imports) {
                imports[moduleName].forEach(importName => {
                  code.push('import "jquery-ui/' + importName + '.js";');
                });
              }

              code.push('let define = null;');
              code.push(source);

              return code.join('\n');
            }
          }
        },
        files: {
          'jquery-ui/core.js': 'jquery-ui/ui/core.js',
          'jquery-ui/draggable.js': 'jquery-ui/ui/draggable.js',
          'jquery-ui/droppable.js': 'jquery-ui/ui/droppable.js',
          'jquery-ui/mouse.js': 'jquery-ui/ui/mouse.js',
          'jquery-ui/position.js': 'jquery-ui/ui/position.js',
          'jquery-ui/resizable.js': 'jquery-ui/ui/resizable.js',
          'jquery-ui/selectable.js': 'jquery-ui/ui/selectable.js',
          'jquery-ui/sortable.js': 'jquery-ui/ui/sortable.js',
          'jquery-ui/widget.js': 'jquery-ui/ui/widget.js',
        }
      },
      all: {
        options: {
          destPrefix: '<%= paths.core %>Public/JavaScript/Contrib'
        },
        files: {
          'autosize.js': 'autosize/dist/autosize.esm.js',
          'require.js': 'requirejs/require.js',
          'cropperjs.js': 'cropperjs/dist/cropper.esm.js',
          'es-module-shims.js': 'es-module-shims/dist/es-module-shims.js',
          'luxon.js': 'luxon/build/es6/luxon.js',
          '../../../../../backend/Resources/Public/Images/colorpicker/jquery.minicolors.png': '../node_modules/@claviska/jquery-minicolors/jquery.minicolors.png',
        }
      }
    },
    terser: {
      options: {
        output: {
          ecma: 8
        }
      },
      thirdparty: {
        files: {
          '<%= paths.core %>Public/JavaScript/Contrib/es-module-shims.js': ['<%= paths.core %>Public/JavaScript/Contrib/es-module-shims.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/broadcastchannel.js': ['<%= paths.core %>Public/JavaScript/Contrib/broadcastchannel.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/cropperjs.js': ['<%= paths.core %>Public/JavaScript/Contrib/cropperjs.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/flatpickr/flatpickr.min.js': ['<%= paths.core %>Public/JavaScript/Contrib/flatpickr/flatpickr.min.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/flatpickr/locales.js': ['<%= paths.core %>Public/JavaScript/Contrib/flatpickr/locales.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/luxon.js': ['<%= paths.core %>Public/JavaScript/Contrib/luxon.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/require.js': ['<%= paths.core %>Public/JavaScript/Contrib/require.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/nprogress.js': ['<%= paths.core %>Public/JavaScript/Contrib/nprogress.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/taboverride.js': ['<%= paths.core %>Public/JavaScript/Contrib/taboverride.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/core.js': ['<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/core.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/draggable.js': ['<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/draggable.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/droppable.js': ['<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/droppable.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/mouse.js': ['<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/mouse.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/position.js': ['<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/position.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/resizable.js': ['<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/resizable.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/selectable.js': ['<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/selectable.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/sortable.js': ['<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/sortable.js'],
          '<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/widget.js': ['<%= paths.core %>Public/JavaScript/Contrib/jquery-ui/widget.js'],
          '<%= paths.dashboard %>Public/JavaScript/Contrib/chartjs.js': ['<%= paths.dashboard %>Public/JavaScript/Contrib/chartjs.js'],
          '<%= paths.dashboard %>Public/JavaScript/Contrib/chunks/helpers.segment.js': ['<%= paths.dashboard %>Public/JavaScript/Contrib/chunks/helpers.segment.js'],
          '<%= paths.install %>Public/JavaScript/chosen.jquery.min.js': ['<%= paths.install %>Public/JavaScript/chosen.jquery.min.js']
        }
      },
      t3editor: {
        files: [
          {
            expand: true,
            src: [
              '<%= paths.t3editor %>Public/JavaScript/Contrib/**/*.js'
            ],
            dest: '<%= paths.t3editor %>Public/JavaScript/Contrib',
            cwd: '.',
            rename: function (dest, src) {
              return src;
            }
          }
        ]
      },
      typescript: {
        options: {
          output: {
            preamble: '/*\n' +
              ' * This file is part of the TYPO3 CMS project.\n' +
              ' *\n' +
              ' * It is free software; you can redistribute it and/or modify it under\n' +
              ' * the terms of the GNU General Public License, either version 2\n' +
              ' * of the License, or any later version.\n' +
              ' *\n' +
              ' * For the full copyright and license information, please read the\n' +
              ' * LICENSE.txt file that was distributed with this source code.\n' +
              ' *\n' +
              ' * The TYPO3 project - inspiring people to share!' +
              '\n' +
              ' */',
            comments: /^!/
          }
        },
        files: [
          {
            expand: true,
            src: [
              '<%= paths.root %>Build/JavaScript/**/*.js',
            ],
            dest: '<%= paths.root %>Build',
            cwd: '.',
          }
        ]
      }
    },
    concurrent: {
      npmcopy: ['npmcopy:dashboard', 'npmcopy:backend', 'npmcopy:umdToEs6', 'npmcopy:jqueryUi', 'npmcopy:install', 'npmcopy:all'],
      lint: ['eslint', 'stylelint', 'exec:lintspaces'],
      compile_assets: ['scripts', 'css'],
      compile_flags: ['flags-build'],
      minify_assets: ['terser:thirdparty', 'terser:t3editor'],
      copy_static: ['copy:core_icons', 'copy:install_icons', 'copy:module_icons', 'copy:extension_icons', 'copy:fonts', 'copy:lit', 'copy:t3editor'],
      build: ['copy:core_icons', 'copy:install_icons', 'copy:module_icons', 'copy:extension_icons', 'copy:fonts', 'copy:t3editor'],
    },
  });

  // Register tasks
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-rollup');
  grunt.loadNpmTasks('grunt-npmcopy');
  grunt.loadNpmTasks('grunt-terser');
  grunt.loadNpmTasks('@lodder/grunt-postcss');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-stylelint');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-concurrent');

  /**
   * grunt lint
   *
   * call "$ grunt lint"
   *
   * this task does the following things:
   * - eslint
   * - stylelint
   * - lintspaces
   */
  grunt.registerTask('lint', ['concurrent:lint']);

  /**
   * grunt css task
   *
   * call "$ grunt css"
   *
   * this task does the following things:
   * - formatsass
   * - sass
   * - postcss
   */
  grunt.registerTask('css', ['formatsass', 'newer:sass', 'newer:postcss']);

  /**
   * grunt update task
   *
   * call "$ grunt update"
   *
   * this task does the following things:
   * - copy some components to a specific destinations because they need to be included via PHP
   */
  grunt.registerTask('update', ['rollup', 'exec:ckeditor', 'concurrent:npmcopy']);

  /**
   * grunt compile-typescript task
   *
   * call "$ grunt compile-typescript"
   *
   * This task does the following things:
   * - 1) Check all TypeScript files (*.ts) with ESLint which are located in sysext/<EXTKEY>/Resources/Private/TypeScript/*.ts
   * - 2) Compiles all TypeScript files (*.ts) which are located in sysext/<EXTKEY>/Resources/Private/TypeScript/*.ts
   */
  grunt.registerTask('compile-typescript', ['tsconfig', 'eslint', 'exec:ts']);

  /**
   * grunt scripts task
   *
   * call "$ grunt scripts"
   *
   * this task does the following things:
   * - 1) Compiles TypeScript (see compile-typescript)
   * - 2) Copy all generated JavaScript files to public folders
   * - 3) Minify build
   */
  grunt.registerTask('scripts', ['compile-typescript', 'newer:terser:typescript', 'newer:copy:ts_files']);

  /**
   * grunt clear-build task
   *
   * call "$ grunt clear-build"
   *
   * Removes all build-related assets, e.g. cache and built files
   */
  grunt.registerTask('clear-build', function () {
    grunt.option('force');
    grunt.file.delete('.cache');
    grunt.file.delete('JavaScript');
  });

  /**
   * grunt tsconfig task
   *
   * call "$ grunt tsconfig"
   *
   * this task updates the tsconfig.json file with modules paths for all sysexts
   */
  grunt.task.registerTask('tsconfig', function () {
    const config = grunt.file.readJSON('tsconfig.json');
    const typescriptPath = grunt.config.get('paths.typescript');
    config.compilerOptions.paths = {};
    grunt.file.expand(typescriptPath + '*/').map(dir => dir.replace(typescriptPath, '')).forEach((path) => {
      const extname = path.match(/^([^/]+?)\//)[1].replace(/_/g, '-')
      config.compilerOptions.paths['@typo3/' + extname + '/*'] = [path + '*'];
    });

    grunt.file.write('tsconfig.json', JSON.stringify(config, null, 4) + '\n');
  });

  /**
   * Outputs a "bell" character. When output, modern terminals flash shortly or produce a notification (usually configurable).
   * This Grunt config uses it after the "watch" task finished compiling, signaling to the developer that her/his changes
   * are now compiled.
   */
  grunt.registerTask('bell', () => console.log('\u0007'));

  /**
   * grunt default task
   *
   * call "$ grunt default"
   *
   * this task does the following things:
   * - execute update task
   * - execute copy task
   * - compile sass files
   * - uglify js files
   * - minifies svg files
   * - compiles TypeScript files
   */
  grunt.registerTask('default', ['clear-build', 'clean', 'update', 'concurrent:copy_static', 'concurrent:compile_flags', 'concurrent:compile_assets', 'concurrent:minify_assets']);

  /**
   * grunt build task (legacy, for those used to it). Use `grunt default` instead.
   *
   * call "$ grunt build"
   *
   * this task does the following things:
   * - execute exec:npm-install task
   * - execute all task
   */
  grunt.registerTask('build', ['exec:npm-install', 'default']);
};
