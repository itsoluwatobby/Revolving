
const modalButton = 'cursor-pointer border border-gray-500 p-1.5 text-xs rounded-md hover:opacity-80 transition-all'

export function PopUpPrompt(){

  return (
    <section className={`absolute flex p-3 rounded-lg z-50 shadow-2xl shadow-slate-700 items-center gap-2 right-20 top-4 bg-slate-800`}>
      <p className={modalButton}>Keep writing</p>
      <p className={modalButton}>Discard</p>
    </section>
  )
}