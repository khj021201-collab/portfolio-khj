const fallbackExperiences = window.PORTFOLIO_EXPERIENCES || [];
const list = document.querySelector('#experience-list');
const status = document.querySelector('#data-status');
const search = document.querySelector('#experience-search');
const filterButtons = [...document.querySelectorAll('.filter-button')];
let records = fallbackExperiences;
let activeCategory = 'all';
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function render() {
  const query = search.value.trim().toLocaleLowerCase();
  const visible = records.filter((record) => {
    const categoryMatch = activeCategory === 'all' || record.category === activeCategory;
    const text = [record.title, record.summary, record.category, ...record.tags].join(' ').toLocaleLowerCase();
    return categoryMatch && text.includes(query);
  });
  list.innerHTML = visible.length ? visible.map((record) => `<article class="experience-card"><span class="experience-category">${escapeHtml(record.category)}</span><h3>${escapeHtml(record.title)}</h3><p>${escapeHtml(record.summary)}</p><div class="experience-tags">${record.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div><span class="experience-result">${escapeHtml(record.result)}</span></article>`).join('') : '<p class="empty-state">조건에 맞는 경험이 없습니다.</p>';
  status.textContent = `${visible.length}개의 경험${window.portfolioDatabase ? ' · 데이터베이스에서 불러옴' : ' · 정적 미리보기'}`;
}
filterButtons.forEach((button) => button.addEventListener('click', () => {activeCategory=button.dataset.category;filterButtons.forEach((item)=>item.classList.toggle('is-active',item===button));render();}));
search.addEventListener('input',render);
document.querySelectorAll('nav a[href^="#"]').forEach((link)=>link.addEventListener('click',(event)=>{const target=document.querySelector(link.getAttribute('href'));if(!target)return;event.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});history.pushState(null,'',link.getAttribute('href'));}));
const year=document.querySelector('#year');if(year)year.textContent=new Date().getFullYear();
(async()=>{try{const response=await fetch('/api/experiences');if(!response.ok)throw new Error('API unavailable');const data=await response.json();if(Array.isArray(data.experiences)){records=data.experiences;window.portfolioDatabase=true;}}catch{window.portfolioDatabase=false;}render();})();
