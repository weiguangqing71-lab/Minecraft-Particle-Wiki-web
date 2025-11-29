import { ParticleDef, PresetDef } from './types';

export const TRANSLATIONS = {
  en: {
    menu: {
      overview: '01_SYS_OVERVIEW',
      syntax: '02_CMD_SYNTAX',
      database: '03_PARTICLE_DB',
      generator: '04_CMD_BUILDER',
      presets: '05_FX_PRESETS'
    },
    sidebar_stats: {
      mem: 'MEM: 64KB OK',
      disk: 'DISK: MOUNTED',
      net: 'NET: 1200 BAUD',
      user: 'USER: ADMIN',
      awaiting: '> AWAITING_INPUT_'
    },
    headers: {
      overview: '01 // DEFINITION',
      syntax: '02 // COMMAND_SYNTAX',
      database: '03 // PARTICLE_DATABASE',
      generator: '04 // COMMAND_GENERATOR',
      presets: '05 // EFFECT_PRESETS',
      subtitle: 'v1.21.0 // PARTICLE_WIKI'
    },
    overview: {
      init: '>> INITIALIZING VISUAL PROTOCOLS...',
      loading: '>> LOADING PARTICLE LIBRARY...',
      complete: 'COMPLETE.',
      alert_title: '[!] SYSTEM ALERT',
      alert_desc: 'Particle commands render client-side only. Excessive count (> 10000) may cause FPS drop or crash.',
      def_title: '01 // DEFINITION',
      def_desc: 'Particles are visual effects in Minecraft. Using the /particle command, admins can spawn them manually. They have no collision and are purely visual.'
    },
    syntax: {
        arg_name_title: 'ARG: <name>',
        arg_name_desc: 'Namespace ID of the particle. E.g., minecraft:flame.',
        arg_pos_title: 'ARG: <pos>',
        arg_pos_desc: 'Spawn position (x y z). Supports relative (~) or local (^) coords.',
        arg_delta_title: 'ARG: <delta>',
        arg_delta_desc: 'Spread area (dx dy dz). Defines volume. Set to 0 for single point.',
        arg_speed_title: 'ARG: <speed>',
        arg_speed_desc: 'Motion speed. For some particles (like Dust), controls color.',
    },
    generator: {
        labels: {
            id: 'PARTICLE_ID',
            pos_x: 'POS_X', pos_y: 'POS_Y', pos_z: 'POS_Z',
            delta_x: 'DELTA_X', delta_y: 'DELTA_Y', delta_z: 'DELTA_Z',
            speed: 'SPEED', count: 'COUNT', mode: 'MODE'
        },
        preview: 'PREVIEW_OUTPUT',
        copy: '[ COPY_COMMAND ]',
        copied: 'COMMAND COPIED TO CLIPBOARD',
        history: 'COMMAND_LOGS',
        clear: '[ CLEAR_LOGS ]',
        empty: '>> NO_LOGS_DETECTED'
    },
    buttons: {
        load: '[LOAD_TO_BUILDER]',
        restore: '[RESTORE]',
        copy: '[ COPY ]'
    },
    validation: {
        required: 'REQUIRED',
        invalid_coord: 'INVALID COORD',
        invalid_number: 'MUST BE NUMBER',
        invalid_integer: 'MUST BE INTEGER',
        min_zero: 'MUST BE >= 0'
    }
  },
  zh: {
    menu: {
      overview: '01_系统概览',
      syntax: '02_指令语法',
      database: '03_粒子数据库',
      generator: '04_指令生成器',
      presets: '05_效果预设'
    },
    sidebar_stats: {
      mem: '内存: 64KB 正常',
      disk: '磁盘: 已挂载',
      net: '网络: 1200 波特',
      user: '用户: 管理员',
      awaiting: '> 等待输入_'
    },
    headers: {
      overview: '01 // 定义说明',
      syntax: '02 // 指令语法',
      database: '03 // 粒子数据库',
      generator: '04 // 指令生成器',
      presets: '05 // 效果预设',
      subtitle: 'v1.21.0 // 粒子维基'
    },
    overview: {
      init: '>> 正在初始化视觉特效协议...',
      loading: '>> 加载粒子库...',
      complete: '完成。',
      alert_title: '[!] 系统警告',
      alert_desc: '粒子命令仅在客户端渲染。过多的粒子 (Count > 10000) 可能导致客户端 FPS 下降或崩溃。请谨慎操作。',
      def_title: '01 // 定义',
      def_desc: '粒子 (Particles) 是 Minecraft 中的视觉效果。通过 /particle 指令，管理员可以在世界任意位置手动生成这些效果。它们没有碰撞箱，不影响物理交互，纯粹用于视觉反馈。'
    },
    syntax: {
        arg_name_title: '参数: <name>',
        arg_name_desc: '粒子的命名空间ID。例如: minecraft:flame。',
        arg_pos_title: '参数: <pos>',
        arg_pos_desc: '生成位置 (x y z)。可以使用相对坐标 (~) 或局部坐标 (^)。',
        arg_delta_title: '参数: <delta>',
        arg_delta_desc: '扩散范围 (dx dy dz)。定义生成区域的体积大小。设为 0 表示单点生成。',
        arg_speed_title: '参数: <speed>',
        arg_speed_desc: '粒子运动速度。对于某些粒子（如 Redstone Dust），此参数控制颜色变化。',
    },
    generator: {
        labels: {
            id: '粒子ID',
            pos_x: '坐标_X', pos_y: '坐标_Y', pos_z: '坐标_Z',
            delta_x: '扩散_X', delta_y: '扩散_Y', delta_z: '扩散_Z',
            speed: '速度', count: '数量', mode: '模式'
        },
        preview: '预览输出',
        copy: '[ 复制指令 ]',
        copied: '指令已复制到剪贴板',
        history: '指令日志',
        clear: '[ 清空日志 ]',
        empty: '>> 未检测到日志'
    },
    buttons: {
        load: '[ 载入生成器 ]',
        restore: '[ 恢复 ]',
        copy: '[ 复制 ]'
    },
    validation: {
        required: '必填项',
        invalid_coord: '坐标格式错误',
        invalid_number: '必须是数字',
        invalid_integer: '必须是整数',
        min_zero: '必须 >= 0'
    }
  }
};

export const PARTICLES: ParticleDef[] = [
  { 
    id: 'flame', 
    name: { en: 'Flame', zh: '火焰 (Flame)' }, 
    description: { en: 'Small fire particle used on torches and furnaces.', zh: '火把和熔炉产生的微小火焰粒子。' }, 
    category: 'common',
    note: { en: 'Speed controls the vertical velocity.', zh: 'Speed 参数控制火焰上升的速度。' }
  },
  { 
    id: 'heart', 
    name: { en: 'Heart', zh: '爱心 (Heart)' }, 
    description: { en: 'Used when breeding animals or taming.', zh: '繁殖动物或驯服时产生的爱心粒子。' }, 
    category: 'common' 
  },
  { 
    id: 'entity_effect', 
    name: { en: 'Potion Swirl', zh: '药水旋涡 (Entity Effect)' }, 
    description: { en: 'Swirls from potions. Highly color customizable.', zh: '药水产生的旋涡。支持高度自定义颜色。' }, 
    category: 'magic',
    note: { en: 'COLOR: Set Count=0. Then dx/dy/dz become R/G/B (0.0-1.0).', zh: '变色: 设数量(Count)=0，dx/dy/dz 即为 R/G/B 颜色值 (0.0-1.0)。' }
  },
  { 
    id: 'dust', 
    name: { en: 'Redstone Dust', zh: '红石粉 (Dust)' }, 
    description: { en: 'Colored dust. Requires RGB and Scale arguments in ID.', zh: '彩色粉尘。需要在 ID 中指定 RGB 和大小参数。' }, 
    category: 'common', 
    example: 'dust 1.0 0.0 0.0 1.0',
    note: { en: 'Syntax: dust <r> <g> <b> <size>. R/G/B are 0.0-1.0.', zh: '语法: dust <r> <g> <b> <size>。颜色值为 0.0-1.0。' }
  },
  { 
    id: 'dust_color_transition', 
    name: { en: 'Dust Transition', zh: '渐变粉尘 (Transition)' }, 
    description: { en: 'Dust that fades from one color to another.', zh: '从一种颜色渐变到另一种颜色的粉尘。' }, 
    category: 'common', 
    example: 'dust_color_transition 1 0 0 1 0 0 1',
    note: { en: 'Syntax: dust_color_transition <fromR> <fromG> <fromB> <size> <toR> <toG> <toB>.', zh: '语法: ... <起始RGB> <大小> <结束RGB>。' }
  },
  { 
    id: 'note', 
    name: { en: 'Note', zh: '音符 (Note)' }, 
    description: { en: 'Musical note. Color changes with pitch.', zh: '音符粒子。颜色随音高变化。' }, 
    category: 'common',
    note: { en: 'COLOR: Set Count=0. dx controls color (pitch). Range 0.0-1.0 (approx 24 semitones).', zh: '变色: 设数量=0。dx 控制颜色(音高)。范围 0-1 (约24个半音)。' }
  },
  { 
    id: 'explosion', 
    name: { en: 'Explosion', zh: '爆炸 (Explosion)' }, 
    description: { en: 'Large explosion cloud effect.', zh: '巨大的爆炸烟云效果。' }, 
    category: 'combat' 
  },
  { 
    id: 'crit', 
    name: { en: 'Critical Hit', zh: '暴击 (Crit)' }, 
    description: { en: 'Generated when dealing a critical hit.', zh: '造成暴击伤害时产生的粒子。' }, 
    category: 'combat' 
  },
  { 
    id: 'enchant', 
    name: { en: 'Enchanting Table', zh: '附魔字符 (Enchant)' }, 
    description: { en: 'Letters that float from books to the table.', zh: '从书架飘向附魔台的神秘字符。' }, 
    category: 'magic',
    note: { en: 'Motion: Particles generally move towards a central point randomly.', zh: '运动: 粒子通常会随机飘向某个中心点。' }
  },
  { 
    id: 'dragon_breath', 
    name: { en: 'Dragon Breath', zh: '龙息 (Dragon Breath)' }, 
    description: { en: 'Purple lingering cloud.', zh: '末影龙留下的紫色滞留云雾。' }, 
    category: 'magic' 
  },
  { 
    id: 'end_rod', 
    name: { en: 'End Rod', zh: '末地烛 (End Rod)' }, 
    description: { en: 'White sparkle, gentle movement.', zh: '白色的光点，缓慢漂浮运动。' }, 
    category: 'environment',
    note: { en: 'Speed controls the random velocity intensity.', zh: 'Speed 参数控制随机运动的剧烈程度。' }
  },
  { 
    id: 'portal', 
    name: { en: 'Portal', zh: '传送门 (Portal)' }, 
    description: { en: 'Purple particles emitted by portals and Endermen.', zh: '传送门和末影人散发的紫色粒子。' }, 
    category: 'environment',
    note: { en: 'Direction: Moves towards the spawn point (reverse velocity).', zh: '方向: 总是向生成点收缩移动 (反向速度)。' }
  },
  { 
    id: 'campfire_cosy_smoke', 
    name: { en: 'Campfire Smoke', zh: '营火烟雾 (Smoke)' }, 
    description: { en: 'Rising smoke effect.', zh: '升起的烟雾效果。' }, 
    category: 'environment',
    note: { en: 'Motion: Moves slowly upwards. Speed affects rise rate.', zh: '运动: 缓慢上升。Speed 影响上升速率。' }
  },
];

export const PRESETS: PresetDef[] = [
  {
    id: 'blood_rain',
    name: { en: 'Blood Rain', zh: '血雨腥风' },
    description: { en: 'Heavy red dust falling down over a large area.', zh: '大范围的红色粉尘下落效果，营造恐怖氛围。' },
    command: 'particle dust 1.0 0.0 0.0 2.0 ~ ~5 ~ 5 1 5 1 100 normal'
  },
  {
    id: 'magic_aura',
    name: { en: 'Magical Aura', zh: '魔法光环' },
    description: { en: 'Dense cloud of enchanting letters and magic particles.', zh: '密集的附魔字符和魔法粒子，适合法阵效果。' },
    command: 'particle enchant ~ ~1 ~ 1 0.5 1 1 100 normal'
  },
  {
    id: 'toxic_fog',
    name: { en: 'Toxic Fog', zh: '剧毒迷雾' },
    description: { en: 'Green lingering clouds that look poisonous.', zh: '绿色的滞留云雾，看起来像有毒气体。' },
    command: 'particle dragon_breath ~ ~1 ~ 3 0.1 3 0.01 50 normal'
  },
  {
    id: 'spark_storm',
    name: { en: 'Spark Storm', zh: '电火花风暴' },
    description: { en: 'Chaotic electric sparks flying everywhere.', zh: '混乱飞舞的电火花，模拟漏电或能量失控。' },
    command: 'particle electric_spark ~ ~1 ~ 2 2 2 1 50 normal'
  },
  {
    id: 'void_gateway',
    name: { en: 'Void Gateway', zh: '虚空裂隙' },
    description: { en: 'Imploding purple particles indicating a rift.', zh: '向内坍塌的紫色粒子，暗示着空间裂隙。' },
    command: 'particle portal ~ ~1 ~ 1 2 1 1 200 normal'
  },
  {
    id: 'holy_light',
    name: { en: 'Holy Light', zh: '圣光降临' },
    description: { en: 'Gentle white sparkles falling or floating.', zh: '柔和的白色光点，适合神圣或治愈场景。' },
    command: 'particle end_rod ~ ~2 ~ 1 1 1 0.05 30 normal'
  }
];