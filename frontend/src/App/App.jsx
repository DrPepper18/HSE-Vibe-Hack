import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Send, Calendar, Clock, CheckCircle, Plus, X, Brain, Coffee, Zap, Trophy, Home, List, CalendarDays, Users, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Привет, прокрастинатор! 😎 Я твой AI-друг по борьбе с ленью! Расскажи, что хочешь сделать, пока TikTok не съел весь твой день!',
      timestamp: new Date(Date.now() - 300000)
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddTask, setShowAddTask] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState(new Date());
  const [energyLevel, setEnergyLevel] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  // avoid unnecessary re-renders: stable callbacks, memoized derived values, timeout cleanup
  const timeoutsRef = useRef(new Set());

  const generateAIResponse = useCallback((userMessage) => {
    const responses = [
      'ОГО! Ты реально хочешь это сделать? Ладно, я поверю! 🤯',
      'Когда ты сделаешь это? Сейчас или когда мама начнет кричать "УЖИН!"? 😅',
      'БРО! Это же элементарно! Давай разобьем на микрозадачи, как TikTok-ролики!',
      'Я уже вижу твое лицо, когда ты поймешь, что сделал всё! 🏆',
      'Ты как тот парень из мемов: "Планирую весь день" vs "Лежу в TikTok" 🤡',
      'Отлично! Только не забудь потом сказать "Я же говорил, что справлюсь!" 💪',
      'Когда ты сделаешь это, я сделаю тебе виртуальный кофе! ☕ (но ты сам купишь настоящий)',
      'Это как уровень в игре! Сделаешь - ачивка "Я не лентяй"! 🎮'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }, []);

  const addTask = useCallback((title, time = '', date = new Date()) => {
    const task = {
      id: Date.now(),
      title,
      completed: false,
      time,
      date: date.toDateString(),
      priority: 'medium'
    };
    setTasks(prev => [...prev, task]);
  }, []);

  const toggleTaskCompletion = useCallback((taskId) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task));
    setEnergyLevel(prev => Math.min(100, prev + 10));
    setPulseKey(prev => prev + 1);
  }, []);

  const deleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const submitNewTask = useCallback((title, time = '', date = new Date(), priority = 'medium') => {
    if (!title || !title.trim()) return;
    addTask(title, time, date);
    setShowAddTask(false);
    setEnergyLevel(prev => Math.min(100, prev + 3));
    setPulseKey(prev => prev + 1);
  }, [addTask]);

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    const timeoutId = setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      };

      const taskMatch = inputMessage.match(/(?:сделать|выполнить|запланировать|нужно|хочу|надо)\s+(.+?)(?:\s+в\s+(\d{1,2}:\d{2}))?/i);
      if (taskMatch) {
        const taskTitle = taskMatch[1] || inputMessage;
        const taskTime = taskMatch[2] || '';
        addTask(taskTitle, taskTime, selectedDate);
        setEnergyLevel(prev => Math.min(100, prev + 5));
        setPulseKey(prev => prev + 1);
      }
      setMessages(prev => [...prev, aiResponse]);
      timeoutsRef.current.delete(timeoutId);
    }, 1000);

    timeoutsRef.current.add(timeoutId);
  }, [inputMessage, generateAIResponse, addTask, selectedDate]);

  useEffect(() => {
    return () => {
      for (const t of timeoutsRef.current) {
        clearTimeout(t);
      }
      timeoutsRef.current.clear();
    };
  }, []);

  // memoized derived values to avoid recalculation every render
  const todayKey = useMemo(() => selectedDate.toDateString(), [selectedDate]);
  const todayTasks = useMemo(() => tasks.filter(task => task.date === todayKey), [tasks, todayKey]);
  const completedTasks = useMemo(() => todayTasks.filter(task => task.completed).length, [todayTasks]);
  const totalTasks = useMemo(() => todayTasks.length, [todayTasks]);
  const overallCompleted = useMemo(() => tasks.filter(task => task.completed).length, [tasks]);
  const overallTotal = useMemo(() => tasks.length, [tasks]);
  const getCalendarTasks = useCallback((date) => tasks.filter(task => task.date === date.toDateString()), [tasks]);

  const formatDate = useCallback((date) => date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' }), []);
  const formatFullDate = useCallback((date) => date.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), []);
  const formatTime = useCallback((date) => date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), []);

  const getEnergyStatus = useCallback(() => {
    if (energyLevel >= 90) return 'ЧЕМПИОН! 🏆';
    if (energyLevel >= 70) return 'ГОРЯЧИЙ! 🔥';
    if (energyLevel >= 50) return 'НАДО КОФЕ! ☕';
    if (energyLevel >= 30) return 'СПАСАЙТЕ! 😵';
    return 'Zzz... 💤';
  }, [energyLevel]);

  // Вынесенный модальный компонент — вводы локальные чтобы не дергать parent state
  const AddTaskModal = React.memo(({ initialDate, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [date, setDate] = useState(initialDate || new Date());

    useEffect(() => {
      setDate(initialDate || new Date());
      setTitle('');
      setTime('');
    }, [initialDate]);

    return (
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-gradient-to-br from-white to-yellow-50 rounded-3xl shadow-2xl w-full max-w-md border-8 border-dashed border-orange-400"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="p-6 border-b-4 border-orange-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-orange-600" />
                НОВАЯ ЗАДАЧА = НОВЫЙ МЕМ!
              </h3>
              <motion.button
                onClick={onClose}
                className="text-gray-400 hover:text-red-500"
                whileHover={{ rotate: 90, scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              >
                <X className="w-8 h-8" />
              </motion.button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ЧТО ТЫ ХОЧЕШЬ СДЕЛАТЬ? (БУДЬ ЧЕСТЕН! 😏)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: 'сделать дз чтобы не получить двойку'"
                className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-4 focus:ring-orange-500/50 focus:border-orange-500 outline-none bg-white/80 font-mono text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ДАТА ЗАДАЧИ</label>
              <input
                type="date"
                value={date.toISOString().split('T')[0]}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-4 focus:ring-orange-500/50 focus:border-orange-500 outline-none bg-white/80 text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ВРЕМЯ (ОПЦИОНАЛЬНО)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-4 focus:ring-orange-500/50 focus:border-orange-500 outline-none bg-white/80 text-lg"
              />
            </div>
          </div>
          <div className="p-6 border-t-4 border-orange-200 flex space-x-3">
            <motion.button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors font-bold text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              НЕТ, Я ЛЕНТЯЙ! 😅
            </motion.button>
            <motion.button
              onClick={() => onSubmit(title, time, date)}
              disabled={!title.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ДА, Я ГЕНИЙ! 🧠
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  });

  // Navigation component with Добрый сок colors
  const Navigation = () => (
    <motion.nav
      className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 shadow-2xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className="w-6 h-6 text-orange-500" />
            </motion.div>
            <button
              onClick={() => setCurrentPage('home')}
              className="text-2xl font-bold text-white hover:text-yellow-200 transition-colors"
            >
              Прокрастинатор Онлайн
            </button>
          </motion.div>

          <div className="hidden md:flex space-x-1">
            {['calendar', 'tasks', 'about'].map((page) => (
              <motion.button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  currentPage === page
                    ? 'bg-white text-orange-500 shadow-lg'
                    : 'text-white hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {page === 'calendar' && <Calendar className="w-5 h-5 inline mr-1" />}
                {page === 'tasks' && <List className="w-5 h-5 inline mr-1" />}
                {page === 'about' && <Users className="w-5 h-5 inline mr-1" />}
                {page === 'calendar' ? 'Календарь' : page === 'tasks' ? 'Задачи' : 'О нас'}
              </motion.button>
            ))}
          </div>

          <motion.button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <Menu className="w-6 h-6" />
          </motion.button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden py-4 space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {['calendar', 'tasks', 'about'].map((page) => (
                <motion.button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2 rounded-lg font-bold transition-all ${
                    currentPage === page
                      ? 'bg-white text-orange-500'
                      : 'text-white bg-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {page === 'calendar' && <Calendar className="w-5 h-5 inline mr-2" />}
                  {page === 'tasks' && <List className="w-5 h-5 inline mr-2" />}
                  {page === 'about' && <Users className="w-5 h-5 inline mr-2" />}
                  {page === 'calendar' ? 'Календарь' : page === 'tasks' ? 'Задачи' : 'О нас'}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );

  // Home Page
  const HomePage = () => (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-4 border-orange-300"
        key={pulseKey}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: [0, 20, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-6 h-6 text-yellow-500" />
            </motion.div>
            <span className="font-bold text-gray-800">УРОВЕНЬ ЭНЕРГИИ:</span>
          </div>
          <motion.div
            className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent"
            animate={{
              scale: energyLevel > 0 ? [1, 1.1, 1] : 1,
              rotate: energyLevel > 0 ? [0, 5, -5, 0] : 0
            }}
            transition={{ duration: 0.5, repeat: energyLevel > 0 ? Infinity : 0 }}
          >
            {getEnergyStatus()}
          </motion.div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden border-2 border-gray-300">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${energyLevel}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="text-center mt-2 text-sm text-gray-600">
          {completedTasks} из {totalTasks} задач выполнено! Ты как тот чувак из мема: "Я же говорил, что справлюсь!" 😎
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-red-300 overflow-hidden"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="p-6 border-b-4 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <motion.div
                animate={{ rotate: [0, 15, 0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Send className="w-6 h-6 mr-2 text-red-600" />
              </motion.div>
              ЧАТ С ТВОИМ AI-ДРУГОМ 👑
            </h2>
            <p className="text-sm text-gray-600 mt-1">Он знает, когда ты прокрастинируешь! 😏</p>
          </div>

          <div className="h-80 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-red-50">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl border-2 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-br-none border-green-500 shadow-lg'
                        : 'bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-bl-none border-orange-500 shadow-lg'
                    }`}
                  >
                    <p className="text-sm font-bold">{message.content}</p>
                    <p className="text-xs opacity-90 mt-1">
                      {message.timestamp.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="p-6 border-t-4 border-red-200 bg-red-50">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Напиши что-то вроде: 'нужно сделать дз по пятерке в 15:00'..."
                className="flex-1 px-4 py-3 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500/50 focus:border-red-500 outline-none bg-white/80 font-mono"
              />
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: inputMessage.trim() ? [
                    "0 4px 6px -1px rgba(249, 115, 22, 0.5)",
                    "0 10px 15px -3px rgba(249, 115, 22, 0.7)",
                    "0 4px 6px -1px rgba(249, 115, 22, 0.5)"
                  ] : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                transition={{ duration: 1.5, repeat: inputMessage.trim() ? Infinity : 0 }}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-pink-300"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-6 border-b-4 border-pink-200 bg-gradient-to-r from-pink-50 to-red-50">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Coffee className="w-6 h-6 mr-2 text-brown-600" />
              ЗАДАЧИ НА СЕГОДНЯ
            </h2>
            {totalTasks > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                Прогресс: {Math.round((completedTasks / totalTasks) * 100)}% - ты почти как Илон Маск! 🚀
              </div>
            )}
          </div>

          <div className="p-6 space-y-3 max-h-80 overflow-y-auto bg-gradient-to-b from-white to-pink-50">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                </motion.div>
                <p className="text-gray-500">Нет задач на сегодня! Или ты просто скрываешься? 🤔</p>
              </div>
            ) : (
              <AnimatePresence>
                {todayTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all ${
                      task.completed
                        ? 'bg-gradient-to-r from-green-200 to-emerald-200 border-green-400'
                        : 'bg-gradient-to-r from-orange-100 to-pink-100 border-orange-300'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 4px 8px rgba(0,0,0,0.15)" }}
                  >
                    <motion.button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-orange-400 hover:border-green-400 bg-white'
                      }`}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        rotate: task.completed ? [0, 360] : 0,
                        backgroundColor: task.completed ? "#10b981" : "#ffffff"
                      }}
                      transition={{ duration: task.completed ? 0.5 : 0 }}
                    >
                      {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                    </motion.button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      {task.time && (
                        <p className="text-xs text-orange-600">⏰ {task.time}</p>
                      )}
                    </div>
                    <motion.button
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500"
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      whileTap={{ scale: 0.8 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  // Tasks Page
  const TasksPage = () => {
    const overallProgress = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

    return (
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-4 border-green-300"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.h2
            className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% auto" }}
          >
            🏆 ТВОЙ ПРОГРЕСС - ЛЕГЕНДАРНЫЙ! 🏆
          </motion.h2>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-4">
              <motion.div
                className="text-5xl font-bold text-gray-800"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {overallProgress}%
              </motion.div>
              <div className="text-lg text-gray-600">общий прогресс по всем задачам</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden border-2 border-gray-300">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Всего задач: {overallTotal}</span>
              <span>Выполнено: {overallCompleted}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-orange-300"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-6 border-b-4 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
            <h2 className="text-2xl font-bold text-gray-900">ВСЕ ТВОИ ЗАДАЧИ</h2>
            <p className="text-sm text-gray-600 mt-1">Каждая галочка - это шаг к величию! ✨</p>
          </div>

          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {tasks.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Нет задач? Создай первую и стань легендой! 🦸‍♂️</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all ${
                      task.completed
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300'
                        : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                      x: task.completed ? 0 : [-5, 5, -5, 0]
                    }}
                  >
                    <motion.button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-orange-400 hover:border-green-400 bg-white'
                      }`}
                      whileTap={{ scale: 0.9 }}
                    >
                      {task.completed && <CheckCircle className="w-5 h-5 text-white" />}
                    </motion.button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                        <span>{new Date(task.date).toLocaleDateString('ru-RU')}</span>
                        {task.time && <span>⏰ {task.time}</span>}
                      </div>
                    </div>
                    <motion.button
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500"
                      whileHover={{ rotate: 90, scale: 1.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Calendar Page
  const CalendarPage = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days = [];

      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }

      return days;
    };

    const navigateMonth = (direction) => {
      setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + direction);
        return newDate;
      });
    };

    const days = getDaysInMonth(currentMonth);
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    return (
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-4 border-orange-300"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="flex items-center justify-between mb-6">
            <motion.button
              onClick={() => navigateMonth(-1)}
              className="px-4 py-2 bg-orange-200 rounded-xl hover:bg-orange-300 transition-colors flex items-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.h2
              className="text-2xl font-bold text-gray-900"
              animate={{
                textShadow: [
                  "0 0 0px rgba(249, 115, 22, 0)",
                  "0 0 10px rgba(249, 115, 22, 0.5)",
                  "0 0 0px rgba(249, 115, 22, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </motion.h2>
            <motion.button
              onClick={() => navigateMonth(1)}
              className="px-4 py-2 bg-orange-200 rounded-xl hover:bg-orange-300 transition-colors flex items-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekdays.map(day => (
              <motion.div
                key={day}
                className="text-center font-bold text-gray-700 py-2 bg-orange-100 rounded-lg"
                whileHover={{ scale: 1.05, backgroundColor: "#fed7aa" }}
                whileTap={{ scale: 0.95 }}
              >
                {day}
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            <AnimatePresence>
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="h-20"></div>;
                }

                const dayTasks = getCalendarTasks(day);
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <motion.div
                    key={day.toDateString()}
                    className={`h-20 p-1 rounded-lg border-2 cursor-pointer ${
                      isToday
                        ? 'bg-gradient-to-r from-yellow-200 to-orange-300 border-yellow-400'
                        : 'bg-white/70 border-orange-200'
                    }`}
                    onClick={() => {
                      setModalInitialDate(day);
                      setShowAddTask(true);
                    }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                      y: -2
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <div className={`text-sm font-bold mb-1 text-center ${
                      isToday ? 'text-red-600' : 'text-gray-800'
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="text-xs text-orange-600 text-center font-bold">
                      {dayTasks.length} задач
                    </div>
                    {dayTasks.slice(0, 2).map(task => (
                      <div key={task.id} className="text-[10px] text-gray-700 truncate">
                        • {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[10px] text-gray-500 text-center">
                        +{dayTasks.length - 2} еще
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-pink-300"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="p-6 border-b-4 border-pink-200 bg-gradient-to-r from-pink-50 to-red-50">
            <h2 className="text-2xl font-bold text-gray-900">БЛИЖАЙШИЕ ЗАДАЧИ</h2>
            <p className="text-sm text-gray-600 mt-1">Не откладывай на потом то, что можно сделать сейчас! ⚡</p>
          </div>

          <div className="p-6 space-y-3">
            {tasks
              .filter(task => !task.completed)
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 5)
              .map((task, index) => (
                <motion.div
                  key={task.id}
                  className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-red-50 border-2 border-pink-200"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 6px 12px rgba(236, 72, 153, 0.3)",
                    x: [0, 5, -5, 0]
                  }}
                >
                  <CalendarDays className="w-5 h-5 text-pink-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-pink-600">
                      {new Date(task.date).toLocaleDateString('ru-RU')} {task.time && `в ${task.time}`}
                    </p>
                  </div>
                </motion.div>
              ))}
            {tasks.filter(task => !task.completed).length === 0 && (
              <motion.div
                className="text-center py-8 text-gray-500"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Все задачи выполнены! Ты - настоящий MVP! 🏆
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // About Page
  const AboutPage = () => (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-4 border-yellow-300"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.h2
          className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent"
          animate={{
            backgroundPosition: ["0%", "100%", "0%"]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% auto" }}
        >
          👋 О ПРОЕКТЕ "ПРОКРАСТИНАТОР ОНЛАЙН"
        </motion.h2>
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <Brain className="w-6 h-6 mr-2 text-yellow-600" />
              НАША МИССИЯ
            </h3>
            <p className="text-gray-700 text-lg">
              Помочь миллионам прокрастинаторов по всему миру перестать откладывать дела на потом и начать жить продуктивной жизнью!
              Мы верим, что каждый человек может быть продуктивным, просто нужно правильное напоминание в правильное время! 😉
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Coffee, title: "ДЛЯ ТЕХ, КТО ЛЮБИТ КОФЕ", desc: "Наш AI подскажет, когда пора делать перерыв для кофе!", color: "from-red-50 to-pink-50", border: "border-red-200", iconColor: "text-red-600" },
              { icon: Trophy, title: "ДЛЯ ЧЕМПИОНОВ", desc: "Отслеживай свой прогресс и получай виртуальные трофеи!", color: "from-orange-50 to-yellow-50", border: "border-orange-200", iconColor: "text-orange-600" },
              { icon: Zap, title: "ДЛЯ ЭНЕРГИЧНЫХ", desc: "Следи за уровнем энергии и планируй задачи правильно!", color: "from-pink-50 to-red-50", border: "border-pink-200", iconColor: "text-pink-600" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className={`bg-gradient-to-r ${item.color} rounded-xl p-6 border-2 ${item.border} text-center`}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  <item.icon className={`w-12 h-12 ${item.iconColor} mx-auto mb-3`} />
                </motion.div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <Users className="w-6 h-6 mr-2 text-green-600" />
              КОМАНДА РАЗРАБОТЧИКОВ
            </h3>
            <p className="text-gray-700 text-lg">
              Небольшая но гордая команда энтузиастов, которые тоже иногда прокрастинируют, но всегда находят силы сделать всё вовремя!
              Мы создали этот сервис, потому что сами часто откладывали дела на потом и решили помочь другим не повторять наших ошибок.
            </p>
          </motion.div>

          <motion.div
            className="text-center py-6"
            animate={{
              boxShadow: [
                "0 0 0px rgba(251, 191, 36, 0)",
                "0 0 20px rgba(251, 191, 36, 0.5)",
                "0 0 0px rgba(251, 191, 36, 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-2xl font-bold text-gray-900">
              НАЧНИ СЕЙЧАС - СТАНЬ ПРОДУКТИВНЫМ ЗАВТРА!
            </p>
            <p className="text-gray-600 mt-2">
              (ну или хотя бы через 5 минут, после того как посмотришь еще один TikTok... мы тебя понимаем! 😅)
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && <HomePage key="home" />}
          {currentPage === 'tasks' && <TasksPage key="tasks" />}
          {currentPage === 'calendar' && <CalendarPage key="calendar" />}
          {currentPage === 'about' && <AboutPage key="about" />}
        </AnimatePresence>
      </div>

      {/* Add Task Modal (локальный ввод, parent обновляется только на submit) */}
      <AnimatePresence>
        {showAddTask && (
          <AddTaskModal
            initialDate={modalInitialDate}
            onClose={() => setShowAddTask(false)}
            onSubmit={submitNewTask}
          />
        )}
      </AnimatePresence>

      {/* Floating Add Task Button */}
      <motion.button
        onClick={() => { setModalInitialDate(new Date()); setShowAddTask(true); }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full shadow-2xl z-40"
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            "0 4px 6px -1px rgba(249, 115, 22, 0.5)",
            "0 20px 25px -5px rgba(249, 115, 22, 0.7)",
            "0 4px 6px -1px rgba(249, 115, 22, 0.5)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Plus className="w-8 h-8 text-green-500" />
      </motion.button>
    </div>
  );
};