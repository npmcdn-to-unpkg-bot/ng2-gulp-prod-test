import gulp from 'gulp';
import systemjsBuilder from 'systemjs-builder';
import tsc from 'gulp-typescript';
import exceptionHandler from 'gulp-plumber';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import util from 'gulp-util';
import sourcemaps from 'gulp-sourcemaps';
// import embedTemplates from 'gulp-angular-embed-templates';

const ROOT = './';
const DEV  = './client/dev/';
const DIST = './client/dist/';
const NODE = './node_modules/';




//****************************************
//          Compile ts files
//****************************************

gulp.task('build_ts:dev', () => {
  let tsconfigSrc = tsc.createProject(ROOT + 'tsconfig.json');

  return tsconfigSrc.src([`${DEV}**`, `!${DIST}**`])
                    .pipe(exceptionHandler())
                    .pipe(tsc(tsconfigSrc))
                    .js
                    .pipe(gulp.dest(`${DEV}`));
});


gulp.task('build_ts:dist', () => {
  let TS_CONFIG   = `${ROOT}tsconfig.json`,
      tsconfigSrc = tsc.createProject(TS_CONFIG,
    {
      // typescript:     require('typescript'),
      removeComments: true,
      // outFile:        'app.js',
      outDir:         'appp',
    });

  console.log(`> Compiling the ts files (${DEV}**/*.ts)...`);

  return gulp.src([`${DEV}**/*.ts`, `!${DEV}boot.ts`])
                    // .pipe(embedTemplates())
                    .pipe(exceptionHandler())
                    .pipe(sourcemaps.init())
                    .pipe(tsc(tsconfigSrc))
                    .pipe(sourcemaps.write('.'))
                    // .js
                    // .on('end', ()=>util.log('> Uglifying...'))
                    // .pipe(uglify())
                    .pipe(gulp.dest(DIST));
});




//****************************************
//      Build static systemjs file
//****************************************

gulp.task('bundle:app', () => {
  var builder = new systemjsBuilder('.', './systemjs.config.js');
  return builder.buildStatic('app', `${DIST}booter.js`);
});




//****************************************
//         Bundle the vendors
//****************************************

gulp.task('bundle:vendor', () => {
    return gulp.src([
        `${NODE}zone.js/dist/zone.js`,
        `${NODE}reflect-metadata/Reflect.js`,
        `${NODE}systemjs/dist/system-polyfills.js`,
        `${NODE}core-js/client/shim.min.js`,
        `${NODE}systemjs/dist/system.js`,
        `${NODE}systemjs/dist/system.src.js`,
        `system.config.js`,
      ])
        .pipe(concat('vendors.js'))
        .pipe(gulp.dest(`${DIST}lib`));
});

gulp.task('bundle:vendor.min', () => {
  return gulp.src([
    `${NODE}core-js/client/shim.min.js`,
    `${NODE}zone.js/dist/zone.js`,
    `${NODE}reflect-metadata/Reflect.js`,
    `${NODE}systemjs/dist/system.src.js`,
  ])
    .pipe(concat('vendors.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(`${DIST}lib`));
});




//****************************************
//         Copy dependencies
//****************************************

gulp.task('copy:vendor', () => {

  gulp.src([`${NODE}rxjs/**/*`])
      .pipe(gulp.dest(`${DIST}lib/rxjs`));

  return gulp.src([`${NODE}@angular/**/*`])
    .pipe(gulp.dest(`${DIST}lib/@angular`));

    // return gulp.src([
    //     `${NODE}rxjs/bundles/Rx.js`,
    //     `${NODE}@angular/**/*`
    // ])
    // .pipe(gulp.dest(`${DIST}lib`));
});




//****************************************
//            Bundle all
//****************************************


gulp.task('vendor', ['bundle:vendor', 'copy:vendor']);
gulp.task('app',    ['build_ts:dist', 'bundle:app']);

gulp.task('bundle', ['vendor', 'app'], () => {
    return gulp.src([
        `${DIST}booter.js`,
        `${DIST}lib/vendors.js`
        // `${DIST}lib/vendors.min.js`
        ])
    .pipe(concat('app.bundle.js'))
    // .pipe(uglify())
    .pipe(gulp.dest(DIST));
});
