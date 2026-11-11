const fallbackExperiences = window.PORTFOLIO_EXPERIENCES || [];
const list = document.querySelector('#experience-list');
const status = document.querySelector('#data-status');
const search = document.querySelector('#experience-search');
const filterButtons = [...document.querySelectorAll('.filter-button')];
let records = fallbackExperiences;
let activeCategory = 'all';
let currentPage = 1;
const PAGE_SIZE = 6;
const paginate = window.portfolioPaginate;
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
  const page = paginate(visible, currentPage, PAGE_SIZE);
  currentPage = page.currentPage;
  list.innerHTML = page.items.length ? page.items.map((record) => `<article class="experience-card"><span class="experience-category">${escapeHtml(record.category)}</span><h3>${escapeHtml(record.title)}</h3><p>${escapeHtml(record.summary)}</p><div class="experience-tags">${record.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div><span class="experience-result">${escapeHtml(record.result)}</span></article>`).join('') : '<p class="empty-state">조건에 맞는 경험이 없습니다.</p>';
  status.textContent = `${visible.length}개의 경험${window.portfolioDatabase ? ' · 데이터베이스에서 불러옴' : ' · 정적 미리보기'}`;
  renderPagination(document.querySelector('#experience-pagination'), currentPage, page.totalPages, (pageNumber) => { currentPage = pageNumber; render(); });
}
function renderPagination(container,page,pageCount,onChange){if(!container)return;container.innerHTML=pageCount<2?'':`<nav class="pagination" aria-label="경험 페이지"><button type="button" data-page="${page-1}" ${page===1?'disabled':''} aria-label="이전 페이지">이전</button><span>${page} / ${pageCount}</span><button type="button" data-page="${page+1}" ${page===pageCount?'disabled':''} aria-label="다음 페이지">다음</button></nav>`;container.querySelectorAll('button[data-page]').forEach((button)=>button.addEventListener('click',()=>onChange(Number(button.dataset.page))));}
filterButtons.forEach((button) => button.addEventListener('click', () => {activeCategory=button.dataset.category;currentPage=1;filterButtons.forEach((item)=>item.classList.toggle('is-active',item===button));render();}));
search.addEventListener('input',()=>{currentPage=1;render();});
document.querySelectorAll('nav a[href^="#"]').forEach((link)=>link.addEventListener('click',(event)=>{const target=document.querySelector(link.getAttribute('href'));if(!target)return;event.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});history.pushState(null,'',link.getAttribute('href'));}));
const emailDialog=document.querySelector('#email-dialog');
document.querySelectorAll('.email-popup-open').forEach((button)=>button.addEventListener('click',()=>emailDialog?.showModal()));
emailDialog?.querySelector('.email-dialog-close')?.addEventListener('click',()=>emailDialog.close());
emailDialog?.addEventListener('click',(event)=>{if(event.target===emailDialog)emailDialog.close()});
emailDialog?.querySelector('.email-copy-button')?.addEventListener('click',async()=>{const email=document.querySelector('#contact-email')?.textContent.trim();const status=emailDialog.querySelector('.email-copy-status');if(!email||!status)return;try{await navigator.clipboard.writeText(email);status.textContent='이메일 주소를 복사했습니다.'}catch{status.textContent=`이메일 주소: ${email}`} });
const year=document.querySelector('#year');if(year)year.textContent=new Date().getFullYear();
list.innerHTML=Array.from({length:PAGE_SIZE},()=>'<article class="experience-card skeleton-card" aria-hidden="true"><span></span><h3></h3><p></p><p></p><div></div></article>').join('');
(async()=>{try{const response=await fetch('/api/experiences');if(!response.ok)throw new Error('API unavailable');const data=await response.json();if(Array.isArray(data.experiences)){records=data.experiences;window.portfolioDatabase=true;}}catch{window.portfolioDatabase=false;}render();})();
