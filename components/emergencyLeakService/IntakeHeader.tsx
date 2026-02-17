import Image from "next/image";

export default function IntakeHeader() {
  return (
    <header className="relative overflow-hidden bg-slate-900 px-6 py-7 text-white md:px-10">
      <div className="absolute inset-0">
        <Image
          src="/droneshot.png"
          alt=""
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/75" />
      </div>

      <div className="relative z-10 mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Image
          src="/New-Logo-Final-White-1.svg"
          alt="Highland Commercial Roofing"
          width={210}
          height={42}
          className="h-auto w-[180px] sm:w-[210px]"
          priority
        />
        <p className="bg-[#2f9750] px-4 py-2 text-left text-sm font-semibold uppercase tracking-[0.14em] text-white sm:text-right sm:text-base md:text-lg">
          Emergency Service Intake
        </p>
      </div>

      <div className="relative z-10 border-t border-slate-700 pt-5">
        <h1 className="inline-block bg-red-900/35 px-3 py-2 text-2xl font-bold leading-tight text-red-100 sm:text-3xl md:text-4xl">
          Request Emergency Leak Service
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200 md:text-base">
          Highland provides fast, accurate leak response and repair support,
          clear scopes for service and reroof work, and timely dispatch from
          office locations across the Western United States.
        </p>
      </div>
    </header>
  );
}
